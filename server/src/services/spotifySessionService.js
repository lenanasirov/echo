/**
 * Echo Issue #23 / Batch 4: Spotify user-session endpoints.
 * Refresh tokens remain in MySQL, encrypted by spotifyConnectionService.
 * Access tokens are cached only in server memory and sent only to the owning
 * authenticated Echo user for direct Spotify Web Playback SDK requests.
 */
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const EARLY_REFRESH_MS = 60_000;

export class SpotifySessionError extends Error {
    constructor(message, status = 502, code = "spotify_session_failed", retryAfterSeconds = null) {
        super(message);
        this.name = "SpotifySessionError";
        this.status = status;
        this.code = code;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

export function createSpotifySessionService({
    connectionService,
    clientId,
    fetchImpl = globalThis.fetch,
    now = () => Date.now()
}) {
    const repo = connectionService;
    for (const method of [
        "getUserSpotifyConnection",
        "getUserSpotifyRefreshTokenSnapshot",
        "rotateUserSpotifyRefreshTokenIfUnchanged",
        "deleteUserSpotifyConnectionIfUnchanged",
        "deleteUserSpotifyConnection"
    ]) {
        if (typeof repo?.[method] !== "function") {
            throw new Error(`Spotify session requires repository method ${method}.`);
        }
    }
    if (typeof clientId !== "string" || !clientId.trim()) {
        throw new Error("Spotify clientId is required.");
    }
    if (typeof fetchImpl !== "function") {
        throw new Error("A fetch implementation is required.");
    }

    // Keyed by authenticated Echo user ID; never shared between users.
    // Cached tokens are never written to browser storage or MySQL.
    const accessTokenCache = new Map();
    const pendingByUser = new Map();

    async function getStatus(userId) {
        const key = requireUserId(userId);
        let connection;
        try {
            connection = await repo.getUserSpotifyConnection(key);
        } catch {
            throw unavailable();
        }
        if (!connection) {
            accessTokenCache.delete(key);
        }
        return {
            connected: Boolean(connection),
            spotifyUserId: connection?.spotifyUserId ?? null,
            scope: connection?.scope ?? null
        };
    }

    /**
     * Serialize requests in this Node process. Database CAS below additionally
     * prevents stale token rotations or deletion after a concurrent reconnect
     * or refresh in another server process.
     */
    async function withUserLock(key, action) {
        const previous = pendingByUser.get(key) ?? Promise.resolve();
        let release;
        const gate = new Promise((resolve) => { release = resolve; });
        const tail = previous.then(() => gate);
        pendingByUser.set(key, tail);
        await previous;
        try {
            return await action();
        } finally {
            release();
            if (pendingByUser.get(key) === tail) {
                pendingByUser.delete(key);
            }
        }
    }

    async function getAccessToken(userId) {
        const key = requireUserId(userId);
        return withUserLock(key, async () => {
            let snapshot;
            try {
                snapshot = await repo.getUserSpotifyRefreshTokenSnapshot(key);
            } catch {
                throw unavailable();
            }
            if (!snapshot) {
                accessTokenCache.delete(key);
                throw reauthorize();
            }

            const cached = accessTokenCache.get(key);
            if (cached?.tokenVersion === snapshot.encryptedVersion &&
                now() + EARLY_REFRESH_MS < cached.expiresAt) {
                return formatTokenResponse(cached.accessToken, cached.expiresAt, now());
            }

            let response;
            try {
                // PKCE refresh: client_id in the form body; no client secret.
                response = await fetchImpl(TOKEN_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        grant_type: "refresh_token",
                        refresh_token: snapshot.refreshToken,
                        client_id: clientId
                    }),
                    signal: AbortSignal.timeout(10_000)
                });
            } catch {
                // A network failure must NEVER invalidate the saved authorization.
                throw unavailable();
            }

            if (!response.ok) {
                let errorCode = null;
                try {
                    const payload = await response.json();
                    errorCode = payload?.error;
                } catch {
                    // Provider error body is optional. Do not log it.
                }

                if (errorCode === "invalid_grant") {
                    // Conditional delete: a concurrent login/rotation may have
                    // already replaced the credentials with a newer token.
                    let deleted;
                    try {
                        deleted = await repo.deleteUserSpotifyConnectionIfUnchanged(
                            key, snapshot.encryptedVersion
                        );
                    } catch {
                        throw unavailable();
                    }
                    accessTokenCache.delete(key);
                    if (!deleted) {
                        throw connectionChanged();
                    }
                    throw reauthorize();
                }
                if (response.status === 429) {
                    const retryAfterSeconds = parseRetryAfter(response.headers?.get?.("retry-after"));
                    throw new SpotifySessionError(
                        "Spotify is rate-limiting requests. Please try again later.",
                        429,
                        "spotify_rate_limited",
                        retryAfterSeconds
                    );
                }
                throw unavailable();
            }

            let data;
            try {
                data = await response.json();
            } catch {
                throw unavailable();
            }
            if (typeof data?.access_token !== "string" || !data.access_token ||
                !Number.isInteger(data?.expires_in) || data.expires_in <= 0) {
                throw unavailable();
            }
            if (data.refresh_token != null &&
                (typeof data.refresh_token !== "string" || !data.refresh_token)) {
                throw unavailable();
            }

            let newVersion = snapshot.encryptedVersion;
            if (data.refresh_token && data.refresh_token !== snapshot.refreshToken) {
                let rotated;
                try {
                    rotated = await repo.rotateUserSpotifyRefreshTokenIfUnchanged(
                        key,
                        snapshot.encryptedVersion,
                        data.refresh_token
                    );
                } catch {
                    throw unavailable();
                }
                if (!rotated) {
                    accessTokenCache.delete(key);
                    throw connectionChanged();
                }
                newVersion = rotated.encryptedVersion;
            }

            const expiresAt = now() + data.expires_in * 1000;
            accessTokenCache.set(key, {
                accessToken: data.access_token,
                expiresAt,
                tokenVersion: newVersion
            });
            return formatTokenResponse(data.access_token, expiresAt, now());
        });
    }

    async function disconnect(userId) {
        const key = requireUserId(userId);
        return withUserLock(key, async () => {
            try {
                await repo.deleteUserSpotifyConnection(key);
            } catch {
                throw unavailable();
            }
            accessTokenCache.delete(key);
            return { disconnected: true };
        });
    }

    return { getStatus, getAccessToken, disconnect };
}

function requireUserId(value) {
    if ((typeof value === "number" && Number.isSafeInteger(value) && value > 0) ||
        (typeof value === "string" && /^[1-9]\d*$/.test(value))) {
        return String(value);
    }
    throw new SpotifySessionError("Authentication required.", 401, "authentication_required");
}

function formatTokenResponse(accessToken, expiresAt, timestamp) {
    return {
        accessToken,
        expiresAt,
        expiresIn: Math.max(0, Math.ceil((expiresAt - timestamp) / 1000))
    };
}

function parseRetryAfter(value) {
    if (value == null || !/^\d{1,5}$/.test(String(value))) return null;
    const seconds = Number(value);
    return seconds <= 3600 ? seconds : null;
}

function reauthorize() {
    return new SpotifySessionError(
        "Connect your Spotify account to continue.",
        401,
        "spotify_reauthorization_required"
    );
}

function unavailable() {
    return new SpotifySessionError(
        "Spotify is temporarily unavailable. Please try again.",
        503,
        "spotify_session_unavailable"
    );
}

function connectionChanged() {
    return new SpotifySessionError(
        "Spotify connection changed. Please try again.",
        409,
        "spotify_connection_changed"
    );
}
