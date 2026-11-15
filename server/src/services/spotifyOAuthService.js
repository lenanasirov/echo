import { createHash, randomBytes } from "node:crypto";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PROFILE_URL = "https://api.spotify.com/v1/me";
const STATE_TTL_MS = 10 * 60_000;

/** Public, non-sensitive errors suitable for JSON API responses. */
export class SpotifyOAuthError extends Error {
    constructor(message, status = 400, code = "spotify_oauth_failed") {
        super(message);
        this.name = "SpotifyOAuthError";
        this.status = status;
        this.code = code;
    }
}

/**
 * Backend OAuth logic. The repository passed here is the existing Batch 2
 * createSpotifyConnectionService result. This layer never sees a database pool
 * or encryption key and never returns the refresh token to the client.
 */
export function createSpotifyOAuthService({
    connectionService,
    clientId,
    redirectUri,
    scopes,
    fetchImpl = globalThis.fetch,
    now = () => Date.now()
}) {
    const repo = connectionService;
    for (const method of [
        "saveUserSpotifyOAuthState",
        "consumeUserSpotifyOAuthState",
        "upsertUserSpotifyConnection"
    ]) {
        if (typeof repo?.[method] !== "function") {
            throw new Error(`Spotify OAuth requires repository method ${method}.`);
        }
    }
    if (typeof clientId !== "string" || !clientId.trim()) {
        throw new Error("Spotify clientId is required.");
    }
    if (typeof redirectUri !== "string" || !redirectUri.trim()) {
        throw new Error("Spotify redirectUri is required.");
    }
    if (typeof scopes !== "string" || !scopes.trim()) {
        throw new Error("Spotify user scopes are required.");
    }
    if (typeof fetchImpl !== "function") {
        throw new Error("A fetch implementation is required.");
    }

    // Fail on misconfiguration rather than silently redirecting to an incorrect URI.
    let parsedRedirect;
    try {
        parsedRedirect = new URL(redirectUri);
    } catch {
        throw new Error("Spotify redirectUri must be an absolute URL.");
    }
    if (!(["https:", "http:"].includes(parsedRedirect.protocol))) {
        throw new Error("Spotify redirectUri must use HTTP or HTTPS.");
    }
    if (parsedRedirect.protocol === "http:" && !["127.0.0.1", "[::1]", "localhost"].includes(parsedRedirect.hostname)) {
        throw new Error("Spotify HTTP redirectUri is allowed only on loopback addresses.");
    }
    if (parsedRedirect.hash) {
        throw new Error("Spotify redirectUri must not contain a URL fragment.");
    }

    async function startConnection(userId) {
        requireUserId(userId);
        const state = randomBytes(32).toString("base64url");
        const codeVerifier = randomBytes(64).toString("base64url");
        const codeChallenge = createHash("sha256")
            .update(codeVerifier, "ascii")
            .digest("base64url");

        try {
            await repo.saveUserSpotifyOAuthState(userId, {
                state,
                codeVerifier,
                expiresAt: new Date(now() + STATE_TTL_MS)
            });
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") {
                throw new SpotifyOAuthError(
                    "Unable to start Spotify connection. Please try again.",
                    409,
                    "spotify_state_collision"
                );
            }
            throw new SpotifyOAuthError(
                "Unable to start Spotify connection.",
                503,
                "spotify_connection_unavailable"
            );
        }

        const authorizationUrl = new URL(AUTHORIZE_URL);
        authorizationUrl.search = new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scopes,
            state,
            code_challenge_method: "S256",
            code_challenge: codeChallenge
        }).toString();

        return { authorizationUrl: authorizationUrl.toString() };
    }

    async function completeConnection(userId, { code, state } = {}) {
        requireUserId(userId);
        if (typeof code !== "string" || !code.trim() || code.length > 4096 ||
            typeof state !== "string" || !/^[A-Za-z0-9_-]{43,128}$/.test(state)) {
            throw new SpotifyOAuthError(
                "A valid authorization code and state are required.",
                400,
                "invalid_spotify_callback"
            );
        }

        let claim;
        try {
            // The repository must make this a single-winner claim and return
            // the verifier associated with exactly the claimed state.
            claim = await repo.consumeUserSpotifyOAuthState(userId, state);
        } catch (error) {
            // Hide whether a state belongs to another user; do not expose SQL errors.
            if (error?.name === "SpotifyOAuthStateError" ||
                ["missing", "expired", "reused", "wrong_user", "wrongUser"].includes(error?.code)) {
                throw new SpotifyOAuthError(
                    "Spotify authorization expired or is invalid. Please connect again.",
                    400,
                    "invalid_spotify_state"
                );
            }
            throw new SpotifyOAuthError(
                "Unable to verify Spotify authorization.",
                503,
                "spotify_state_unavailable"
            );
        }

        if (claim?.state !== state || String(claim?.userId) !== String(userId) ||
            typeof claim?.codeVerifier !== "string" || !claim.codeVerifier) {
            throw new SpotifyOAuthError(
                "Spotify authorization expired or is invalid. Please connect again.",
                400,
                "invalid_spotify_state"
            );
        }

        let tokenResponse;
        try {
            tokenResponse = await fetchImpl(TOKEN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: clientId,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: redirectUri,
                    code_verifier: claim.codeVerifier
                }),
                signal: AbortSignal.timeout(10000)
            });
        } catch {
            throw new SpotifyOAuthError(
                "Spotify is temporarily unavailable. Please connect again.",
                502,
                "spotify_token_unavailable"
            );
        }

        if (!tokenResponse.ok) {
            throw new SpotifyOAuthError(
                tokenResponse.status === 429
                    ? "Spotify is rate-limiting requests. Please try again later."
                    : "Spotify authorization failed. Please connect again.",
                tokenResponse.status === 429 ? 429 : tokenResponse.status === 400 || tokenResponse.status === 401 ? 400 : 502,
                "spotify_exchange_failed"
            );
        }

        let tokens;
        try {
            tokens = await tokenResponse.json();
        } catch {
            throw new SpotifyOAuthError(
                "Spotify returned an invalid authorization response.",
                502,
                "spotify_invalid_response"
            );
        }
        if (typeof tokens?.access_token !== "string" || !tokens.access_token ||
            typeof tokens?.refresh_token !== "string" || !tokens.refresh_token ||
            !Number.isFinite(tokens?.expires_in) || tokens.expires_in <= 0) {
            throw new SpotifyOAuthError(
                "Spotify returned an incomplete authorization response.",
                502,
                "spotify_invalid_response"
            );
        }

        // Optional: stable account_id is preferred over the legacy profile id.
        // Failure to fetch optional metadata must not discard valid tokens.
        let spotifyUserId = null;
        try {
            const profileResponse = await fetchImpl(PROFILE_URL, {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
                signal: AbortSignal.timeout(10000)
            });
            if (profileResponse.ok) {
                const profile = await profileResponse.json();
                const identifier = profile?.account_id ?? profile?.id;
                if (typeof identifier === "string" && identifier.length <= 128) {
                    spotifyUserId = identifier;
                }
            }
        } catch {
            // Account metadata is optional; do not log tokens or request objects.
        }

        // Store only scopes Spotify explicitly confirmed, not merely requested.
        const scope = typeof tokens.scope === "string" && tokens.scope.length <= 512
            ? tokens.scope : null;

        try {
            await repo.upsertUserSpotifyConnection(userId, {
                refreshToken: tokens.refresh_token,
                spotifyUserId,
                scope
            });
        } catch {
            throw new SpotifyOAuthError(
                "Unable to save Spotify connection. Please connect again.",
                503,
                "spotify_save_failed"
            );
        }

        return {
            accessToken: tokens.access_token,
            expiresIn: tokens.expires_in,
            expiresAt: now() + tokens.expires_in * 1000,
            spotifyUserId,
            scope
        };
    }

    return { startConnection, completeConnection };
}

function requireUserId(userId) {
    if (!(typeof userId === "number" && Number.isSafeInteger(userId) && userId > 0) &&
        !(typeof userId === "string" && /^[1-9]\d*$/.test(userId))) {
        throw new SpotifyOAuthError("Authentication required.", 401, "authentication_required");
    }
}
