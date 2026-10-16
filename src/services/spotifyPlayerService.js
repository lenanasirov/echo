import { getSpotifyAccessToken } from "./spotifyAuthService";

const SPOTIFY_SDK_URL = "https://sdk.scdn.co/spotify-player.js";

let sdkPromise = null;
let player = null;
let deviceId = null;
let initializationPromise = null;
let activeCallbacks = {};

const loadSpotifySDK = () => {
    if (window.Spotify) {
        return Promise.resolve(window.Spotify);
    }

    if (sdkPromise) {
        return sdkPromise;
    }

    sdkPromise = new Promise((resolve, reject) => {
        const previousCallback = window.onSpotifyWebPlaybackSDKReady;

        window.onSpotifyWebPlaybackSDKReady = () => {
            previousCallback?.();
            resolve(window.Spotify);
        };

        let script = document.querySelector(
            `script[src="${SPOTIFY_SDK_URL}"]`
        );

        if (!script) {
            script = document.createElement("script");
            script.src = SPOTIFY_SDK_URL;
            script.async = true;
            document.body.appendChild(script);
        }

        script.addEventListener("error", () => {
            sdkPromise = null;
            reject(new Error("Failed to load the Spotify Web Playback SDK."));
        }, { once: true });
    });

    return sdkPromise;
};

export const initializeSpotifyPlayer = async (callbacks = {}) => {
    activeCallbacks = callbacks;

    if (player) {
        return player;
    }

    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        const Spotify = await loadSpotifySDK();

        const newPlayer = new Spotify.Player({
            name: "Echo Web Player",
            getOAuthToken: async (callback) => {
                try {
                    const accessToken = await getSpotifyAccessToken();
                    callback(accessToken);
                } catch (error) {
                    activeCallbacks.onError?.(error);
                }
            },
            volume: 0.5,
        });

        player = newPlayer;

        newPlayer.addListener("ready", ({ device_id }) => {
            deviceId = device_id;
            activeCallbacks.onReady?.(device_id);
        });

        newPlayer.addListener("not_ready", ({ device_id }) => {
            activeCallbacks.onNotReady?.(device_id);
        });

        newPlayer.addListener("initialization_error", ({ message }) => {
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("authentication_error", ({ message }) => {
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("account_error", ({ message }) => {
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("playback_error", ({ message }) => {
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("player_state_changed", (state) => {
            activeCallbacks.onStateChange?.(state);
        });

        const connected = await newPlayer.connect();

        if (!connected) {
            newPlayer.disconnect();
            if (player === newPlayer) {
                player = null;
                deviceId = null;
            }
            throw new Error("Could not connect to the Spotify player.");
        }

        return newPlayer;
    })();

    try {
        return await initializationPromise;
    } catch (error) {
        initializationPromise = null;
        throw error;
    }
};

export const getSpotifyPlayer = () => player;

export const activateSpotifyPlayer = async () => {
    if (!player) {
        throw new Error("Spotify player is not initialized.");
    }

    await player.activateElement();
};

export const disconnectSpotifyPlayer = () => {
    if (player) {
        player.disconnect();
        player = null;
    }

    deviceId = null;
};

export const playSpotifyTrack = async (trackId) => {
    if (!deviceId) {
        throw new Error("Spotify player is not ready yet.");
    }

    if (!trackId) {
        throw new Error("A Spotify track ID is required.");
    }

    const accessToken = await getSpotifyAccessToken();


    const devicesResponse = await fetch(
        "https://api.spotify.com/v1/me/player/devices",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    
    const devicesData = await devicesResponse
        .json()
        .catch(() => ({}));
    
    if (!devicesResponse.ok) {
        throw new Error(
            `Spotify device list failed (${devicesResponse.status}): ${
                devicesData.error?.message ||
                devicesData.error ||
                "Unknown error"
            }`
        );
    }
    
    // Transfer playback to Echo's Web Playback SDK device.
    const transferResponse = await fetch(
        "https://api.spotify.com/v1/me/player",
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                device_ids: [deviceId],
                play: false,
            }),
        }
    );

    if (!transferResponse.ok) {
        const data = await transferResponse.json().catch(() => ({}));

        throw new Error(
            `Spotify device transfer failed (${transferResponse.status}): ${
                data.error?.message || "Unknown error"
            }`
        );
    }

    const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`],
                position_ms: 0,
            }),
        }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            `Spotify playback failed (${response.status}): ${
                data.error?.message || "Unknown error"
            }`
        );
    }
};

export const pauseSpotifyPlayback = async () => {
    if (!player) {
        throw new Error("Spotify player is not initialized.");
    }

    await player.pause();
};

export const resumeSpotifyPlayback = async () => {
    if (!player) {
        throw new Error("Spotify player is not initialized.");
    }

    await player.resume();
};


export const seekSpotifyPlayback = async (positionMs) => {
    if (!player) {
        throw new Error("Spotify player is not initialized.");
    }

    await player.seek(positionMs);
};
