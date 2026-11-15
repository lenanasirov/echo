/**
 * Echo Issue #23 — browser Spotify authorization adapter.
 *
 * All long-lived Spotify credentials and OAuth PKCE state live on Echo's server.
 * Only short-lived Spotify access tokens may be cached in this module's memory.
 * The non-sensitive return path and pending track remain in sessionStorage.
 *
 * Dependency injection makes the logic testable without React, Vite or Spotify.
 */
const EARLY_REFRESH_MS = 60_000;
const LEGACY_SECRET_KEYS = [
    "spotify_code_verifier",
    "spotify_auth_state",
    "spotify_access_token",
    "spotify_refresh_token",
    "spotify_token_expires_at"
];
const RETURN_TO_KEY = "spotify_return_to";
const PENDING_PLAYBACK_KEY = "spotify_pending_playback";

export function createSpotifyAuthClient({ api, storage, location, now = () => Date.now() }) {
    if (typeof api?.get !== "function" || typeof api?.post !== "function" ||
        typeof api?.delete !== "function") {
        throw new Error("Spotify authorization requires an HTTP API client.");
    }
    if (!storage || typeof storage.getItem !== "function" ||
        typeof storage.setItem !== "function" || typeof storage.removeItem !== "function") {
        throw new Error("Spotify authorization requires sessionStorage.");
    }
    if (!location || typeof location.assign !== "function") {
        throw new Error("Spotify authorization requires window.location.");
    }

    let accessToken = null;
    let accessTokenExpiresAt = 0;
    let pendingTokenRequest = null;
    let generation = 0;

    // One-time migration away from the old browser-owned PKCE and token storage.
    // No secrets from the previous implementation should survive in this tab.
    function clearLegacyCredentials() {
        for (const key of LEGACY_SECRET_KEYS) storage.removeItem(key);
    }
    clearLegacyCredentials();

    function resetSpotifyAccessToken() {
        generation += 1;
        accessToken = null;
        accessTokenExpiresAt = 0;
        pendingTokenRequest = null;
        clearLegacyCredentials();
    }

    function cacheAccessToken(payload) {
        if (typeof payload?.accessToken !== "string" || !payload.accessToken) {
            throw new Error("Echo returned an invalid Spotify access token.");
        }
        const expiresAt = Number(payload.expiresAt) ||
            (now() + Number(payload.expiresIn) * 1000);
        if (!Number.isFinite(expiresAt) || expiresAt <= now()) {
            throw new Error("Echo returned an expired Spotify access token.");
        }
        accessToken = payload.accessToken;
        accessTokenExpiresAt = expiresAt;
        return accessToken;
    }

    function getSafeReturnTo(path) {
        if (typeof path !== "string" || !path.startsWith("/") ||
            path.startsWith("//") || path.startsWith("/\\") ||
            /[\\\r\n\u0000-\u001f]/.test(path)) {
            return "/feed";
        }
        return path;
    }

    function toError(error, fallback) {
        const backendCode = error?.response?.data?.code;
        const backendMessage = error?.response?.data?.message;
        const message = typeof backendMessage === "string" && backendMessage.length < 300
            ? backendMessage
            : fallback;
        const result = new Error(message);
        result.code = typeof backendCode === "string" ? backendCode : null;
        result.status = error?.response?.status ?? null;
        return result;
    }

    async function startSpotifyAuthorization(returnTo = location.pathname || "/feed") {
        storage.setItem(RETURN_TO_KEY, getSafeReturnTo(returnTo));
        let authorizationUrl;
        try {
            const response = await api.post("/spotify/connect");
            authorizationUrl = response?.data?.data?.authorizationUrl;
        } catch (error) {
            throw toError(error, "Couldn't start Spotify authorization. Please try again.");
        }
        let parsed;
        try {
            parsed = new URL(authorizationUrl);
        } catch {
            throw new Error("Echo returned an invalid Spotify authorization URL.");
        }
        if (parsed.origin !== "https://accounts.spotify.com" ||
            parsed.pathname !== "/authorize") {
            throw new Error("Echo returned an invalid Spotify authorization URL.");
        }
        location.assign(parsed.toString());
    }

    async function completeSpotifyAuthorization(code, returnedState) {
        if (typeof code !== "string" || !code ||
            typeof returnedState !== "string" || !returnedState) {
            throw new Error("Spotify authorization is missing required information.");
        }
        const requestGeneration = generation;
        let payload;
        try {
            const response = await api.post("/spotify/callback", {
                code,
                state: returnedState
            });
            payload = response?.data?.data;
        } catch (error) {
            throw toError(error, "Couldn't connect Spotify. Please try again.");
        }
        if (requestGeneration !== generation) {
            throw new Error("Spotify authorization was cancelled.");
        }
        // Kept only for the remainder of this page load; callback redirects
        // to the app and the provider obtains a fresh token from the backend.
        cacheAccessToken(payload);
        return payload;
    }

    async function getSpotifyConnectionStatus() {
        try {
            const response = await api.get("/spotify/status");
            const result = response?.data?.data;
            if (typeof result?.connected !== "boolean") {
                throw new Error("Invalid Spotify connection status.");
            }
            if (!result.connected) resetSpotifyAccessToken();
            return result;
        } catch (error) {
            if (error?.message === "Invalid Spotify connection status.") throw error;
            throw toError(error, "Couldn't check your Spotify connection. Please try again.");
        }
    }

    async function getSpotifyAccessToken() {
        if (accessToken && now() + EARLY_REFRESH_MS < accessTokenExpiresAt) {
            return accessToken;
        }
        if (pendingTokenRequest?.generation === generation) {
            return pendingTokenRequest.promise;
        }
        const requestGeneration = generation;
        const promise = (async () => {
            try {
                const response = await api.get("/spotify/access-token");
                if (requestGeneration !== generation) {
                    throw new Error("Spotify session has changed.");
                }
                return cacheAccessToken(response?.data?.data);
            } catch (error) {
                if (requestGeneration !== generation) {
                    throw new Error("Spotify session has changed.");
                }
                if (error?.response?.data?.code === "spotify_reauthorization_required") {
                    resetSpotifyAccessToken();
                }
                if (error?.message === "Echo returned an invalid Spotify access token." ||
                    error?.message === "Echo returned an expired Spotify access token.") {
                    throw error;
                }
                throw toError(error, "Couldn't retrieve your Spotify access token. Please try again.");
            }
        })();
        pendingTokenRequest = { generation: requestGeneration, promise };
        try {
            return await promise;
        } finally {
            if (pendingTokenRequest?.promise === promise) pendingTokenRequest = null;
        }
    }

    // Retained for any legacy synchronous callers. Authoritative connection
    // status requires getSpotifyConnectionStatus(), which talks to Echo's API.
    function isSpotifyConnected() {
        return Boolean(accessToken && now() < accessTokenExpiresAt);
    }

    // Echo logout: clear only THIS browser session, not the saved MySQL record.
    function disconnectSpotify() {
        resetSpotifyAccessToken();
        storage.removeItem(PENDING_PLAYBACK_KEY);
        storage.removeItem(RETURN_TO_KEY);
    }

    // Explicit Profile disconnect: remove the server-side record as well.
    async function disconnectSpotifyAccount() {
        resetSpotifyAccessToken();
        try {
            await api.delete("/spotify/connection");
        } catch (error) {
            throw toError(error, "Couldn't disconnect Spotify. Please try again.");
        }
        disconnectSpotify();
    }

    function getSpotifyReturnTo() {
        return getSafeReturnTo(storage.getItem(RETURN_TO_KEY));
    }

    function consumeSpotifyReturnTo() {
        const returnTo = getSpotifyReturnTo();
        storage.removeItem(RETURN_TO_KEY);
        return returnTo;
    }

    function savePendingSpotifyPlayback(track) {
        storage.setItem(PENDING_PLAYBACK_KEY, JSON.stringify(track));
    }

    function consumePendingSpotifyPlayback() {
        const saved = storage.getItem(PENDING_PLAYBACK_KEY);
        storage.removeItem(PENDING_PLAYBACK_KEY);
        if (!saved) return null;
        try { return JSON.parse(saved); } catch { return null; }
    }

    function clearPendingSpotifyPlayback() {
        storage.removeItem(PENDING_PLAYBACK_KEY);
    }

    return {
        startSpotifyAuthorization,
        completeSpotifyAuthorization,
        getSpotifyConnectionStatus,
        getSpotifyAccessToken,
        isSpotifyConnected,
        resetSpotifyAccessToken,
        disconnectSpotify,
        disconnectSpotifyAccount,
        getSpotifyReturnTo,
        consumeSpotifyReturnTo,
        savePendingSpotifyPlayback,
        consumePendingSpotifyPlayback,
        clearPendingSpotifyPlayback
    };
}
