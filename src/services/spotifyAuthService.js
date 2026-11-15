import api from "./api";
import { createSpotifyAuthClient } from "./spotifyAuthClient";

// A single browser-scoped instance. The backend owns OAuth state and refresh
// tokens; only a short-lived access token is cached here in module memory.
const spotifyAuthClient = createSpotifyAuthClient({
    api,
    storage: window.sessionStorage,
    location: window.location
});

export const {
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
} = spotifyAuthClient;
