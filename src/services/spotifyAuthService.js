const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const REDIRECT_URI = "http://127.0.0.1:5173/spotify/callback";

const SCOPES = [
    "streaming",
    "user-read-private",
    "user-read-email",
    "user-modify-playback-state",
    "user-read-playback-state",
];

const STORAGE_KEYS = {
    verifier: "spotify_code_verifier",
    state: "spotify_auth_state",
    accessToken: "spotify_access_token",
    refreshToken: "spotify_refresh_token",
    expiresAt: "spotify_token_expires_at",
};

const getClientId = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

    if (!clientId) {
        throw new Error(
            "Spotify Client ID is missing. Check the root .env file."
        );
    }

    return clientId;
};

const encodeBase64Url = (bytes) => {
    const binary = Array.from(bytes)
        .map((byte) => String.fromCharCode(byte))
        .join("");

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
};

const generateRandomString = (length = 64) => {
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);

    return encodeBase64Url(values);
};

const generateCodeChallenge = async (verifier) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);

    return encodeBase64Url(new Uint8Array(digest));
};

const saveTokens = (data) => {
    sessionStorage.setItem(
        STORAGE_KEYS.accessToken,
        data.access_token
    );

    if (data.refresh_token) {
        sessionStorage.setItem(
            STORAGE_KEYS.refreshToken,
            data.refresh_token
        );
    }

    sessionStorage.setItem(
        STORAGE_KEYS.expiresAt,
        String(Date.now() + data.expires_in * 1000)
    );
};

const clearTokens = () => {
    sessionStorage.removeItem(STORAGE_KEYS.accessToken);
    sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
    sessionStorage.removeItem(STORAGE_KEYS.expiresAt);
};

const requestTokens = async (body) => {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error_description ||
            data.error ||
            "Spotify token request failed."
        );
    }

    return data;
};

export const startSpotifyAuthorization = async () => {
    const clientId = getClientId();
    const verifier = generateRandomString();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateRandomString(32);

    sessionStorage.setItem(STORAGE_KEYS.verifier, verifier);
    sessionStorage.setItem(STORAGE_KEYS.state, state);

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(" "),
        state,
        code_challenge_method: "S256",
        code_challenge: challenge,
    });

    window.location.assign(
        `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`
    );
};

export const completeSpotifyAuthorization = async (
    code,
    returnedState
) => {
    const expectedState = sessionStorage.getItem(STORAGE_KEYS.state);
    const verifier = sessionStorage.getItem(STORAGE_KEYS.verifier);

    if (!expectedState || returnedState !== expectedState) {
        throw new Error(
            "Spotify authorization could not be verified. Please try again."
        );
    }

    if (!verifier) {
        throw new Error(
            "Spotify authorization expired. Please connect again."
        );
    }

    const data = await requestTokens(
        new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            client_id: getClientId(),
            code_verifier: verifier,
        })
    );

    saveTokens(data);

    sessionStorage.removeItem(STORAGE_KEYS.verifier);
    sessionStorage.removeItem(STORAGE_KEYS.state);
};

export const getSpotifyAccessToken = async () => {
    const accessToken = sessionStorage.getItem(
        STORAGE_KEYS.accessToken
    );

    const expiresAt = Number(
        sessionStorage.getItem(STORAGE_KEYS.expiresAt) || 0
    );

    // Reuse a token if it has more than one minute remaining.
    if (accessToken && Date.now() < expiresAt - 60_000) {
        return accessToken;
    }

    const refreshToken = sessionStorage.getItem(
        STORAGE_KEYS.refreshToken
    );

    if (!refreshToken) {
        clearTokens();
        throw new Error("Connect your Spotify account to continue.");
    }

    try {
        const data = await requestTokens(
            new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: getClientId(),
            })
        );

        saveTokens(data);
        return data.access_token;
    } catch (error) {
        clearTokens();
        throw error;
    }
};

export const isSpotifyConnected = () => {
    return Boolean(
        sessionStorage.getItem(STORAGE_KEYS.accessToken) &&
        sessionStorage.getItem(STORAGE_KEYS.refreshToken)
    );
};

export const disconnectSpotify = () => {
    clearTokens();
};