import { getSpotifyAccessToken } from "./spotifyAuthService";

const SPOTIFY_SDK_URL = "https://sdk.scdn.co/spotify-player.js";

let sdkPromise = null;
let player = null;
let deviceId = null;
let initializationPromise = null;
let initializationGeneration = null;
let playerGeneration = null;
let lifecycleGeneration = 0;
let activeCallbacks = {};

const logSpotify = (...args) => {
    console.info("[Echo Spotify]", ...args);
};

const warnSpotify = (...args) => {
    console.warn("[Echo Spotify]", ...args);
};

const errorSpotify = (...args) => {
    console.error("[Echo Spotify]", ...args);
};

const logCurrentSdkState = async (label) => {
    const currentPlayer = player;

    if (!currentPlayer) {
        warnSpotify(`${label}: No SDK player available.`);
        return;
    }

    try {
        const state = await currentPlayer.getCurrentState();

        logSpotify(`${label}: SDK current state.`, {
            hasState: Boolean(state),
            paused: state?.paused,
            position: state?.position,
            duration: state?.duration,
            trackId: state?.track_window?.current_track?.id,
            trackName: state?.track_window?.current_track?.name,
        });
    } catch (error) {
        errorSpotify(`${label}: Failed to read SDK state.`, error);
    }
};

const logSpotifyWebPlayback = async (label) => {
    try {
        const accessToken = await getSpotifyAccessToken();

        const response = await fetch(
            "https://api.spotify.com/v1/me/player",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (response.status === 204) {
            logSpotify(`${label}: Spotify reports no current playback.`);
            return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            warnSpotify(`${label}: Spotify playback diagnostic failed.`, {
                status: response.status,
                error: data.error,
            });
            return;
        }

        logSpotify(`${label}: Spotify Web API playback state.`, {
            isPlaying: data.is_playing,
            progressMs: data.progress_ms,
            trackId: data.item?.id,
            trackName: data.item?.name,
            device: data.device
                ? {
                    id: data.device.id,
                    name: data.device.name,
                    type: data.device.type,
                    isActive: data.device.is_active,
                    isRestricted: data.device.is_restricted,
                    volumePercent: data.device.volume_percent,
                }
                : null,
        });
    } catch (error) {
        errorSpotify(`${label}: Spotify playback diagnostic failed.`, error);
    }
};

const schedulePlaybackDiagnostics = (label, delays = [500, 2500]) => {
    for (const delay of delays) {
        setTimeout(() => {
            logCurrentSdkState(`${label} (+${delay}ms)`);
            logSpotifyWebPlayback(`${label} (+${delay}ms)`);
        }, delay);
    }
};


const loadSpotifySDK = () => {
    if (window.Spotify) {
        logSpotify("SDK already loaded.");
        return Promise.resolve(window.Spotify);
    }

    if (sdkPromise) {
        logSpotify("Reusing existing SDK loading promise.");
        return sdkPromise;
    }

    logSpotify("Loading Spotify Web Playback SDK.");

    sdkPromise = new Promise((resolve, reject) => {
        const previousCallback = window.onSpotifyWebPlaybackSDKReady;

        window.onSpotifyWebPlaybackSDKReady = () => {
            logSpotify("Spotify SDK ready callback fired.");

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

            logSpotify("Spotify SDK script added to the page.");
        } else {
            logSpotify("Spotify SDK script already exists on the page.");
        }

        script.addEventListener(
            "error",
            () => {
                errorSpotify("Failed to load Spotify SDK script.");

                sdkPromise = null;

                reject(
                    new Error(
                        "Failed to load the Spotify Web Playback SDK."
                    )
                );
            },
            { once: true }
        );
    });

    return sdkPromise;
};

const isCurrentPlayer = (candidate, generation) =>
    player === candidate && lifecycleGeneration === generation;

export const initializeSpotifyPlayer = async (callbacks = {}) => {
    activeCallbacks = callbacks;

    logSpotify("Player initialization requested.", {
        hasPlayer: Boolean(player),
        hasDeviceId: Boolean(deviceId),
        hasInitializationPromise: Boolean(initializationPromise),
        lifecycleGeneration,
    });

    if (player && playerGeneration === lifecycleGeneration) {
        logSpotify("Reusing existing player.", { deviceId });
        return player;
    }

    if (
        initializationPromise &&
        initializationGeneration === lifecycleGeneration
    ) {
        logSpotify("Reusing existing initialization promise.");
        return initializationPromise;
    }

    const generation = lifecycleGeneration;

    const promise = (async () => {
        const Spotify = await loadSpotifySDK();

        // Cleanup may have happened while the SDK was loading.
        if (generation !== lifecycleGeneration) {
            warnSpotify("Initialization cancelled before player creation.");
            throw new Error("Spotify player initialization was cancelled.");
        }

        logSpotify("Creating Spotify Web Playback SDK player.");

        const newPlayer = new Spotify.Player({
            name: "Echo Web Player",
            getOAuthToken: async (callback) => {
                logSpotify("SDK requested an OAuth access token.");

                try {
                    const accessToken = await getSpotifyAccessToken();

                    logSpotify("Access token retrieved for SDK.");
                    callback(accessToken);
                } catch (error) {
                    errorSpotify("Failed to provide SDK access token.", error);

                    if (isCurrentPlayer(newPlayer, generation)) {
                        activeCallbacks.onError?.(error);
                    }
                }
            },
            volume: 0.5,
        });

        player = newPlayer;
        playerGeneration = generation;

        newPlayer.addListener("ready", ({ device_id }) => {
            if (!isCurrentPlayer(newPlayer, generation)) {
                warnSpotify("Ignoring ready event from a stale player.");
                return;
            }

            deviceId = device_id;

            logSpotify("Player ready.", { deviceId: device_id });
            activeCallbacks.onReady?.(device_id);
        });

        newPlayer.addListener("not_ready", ({ device_id }) => {
            if (!isCurrentPlayer(newPlayer, generation)) {
                return;
            }

            warnSpotify("Player reported not_ready.", {
                deviceId: device_id,
                currentDeviceId: deviceId,
            });

            if (device_id === deviceId) {
                deviceId = null;
            }

            activeCallbacks.onNotReady?.(device_id);
        });

        newPlayer.addListener("initialization_error", ({ message }) => {
            if (!isCurrentPlayer(newPlayer, generation)) return;

            errorSpotify("SDK initialization error:", message);
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("authentication_error", ({ message }) => {
            if (!isCurrentPlayer(newPlayer, generation)) return;

            errorSpotify("SDK authentication error:", message);
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("account_error", ({ message }) => {
            if (!isCurrentPlayer(newPlayer, generation)) return;

            errorSpotify("SDK account error:", message);
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("playback_error", ({ message }) => {
            if (!isCurrentPlayer(newPlayer, generation)) return;

            errorSpotify("SDK playback error:", message);
            activeCallbacks.onError?.(new Error(message));
        });

        newPlayer.addListener("player_state_changed", (state) => {
            if (!isCurrentPlayer(newPlayer, generation)) {
                return;
            }

            if (!state) {
                warnSpotify("SDK player state changed to null.");
                activeCallbacks.onStateChange?.(state);
                return;
            }

            logSpotify("Player state changed.", {
                paused: state.paused,
                position: state.position,
                duration: state.duration,
                trackId: state.track_window?.current_track?.id,
                trackName: state.track_window?.current_track?.name,
                artistNames: state.track_window?.current_track?.artists
                    ?.map((artist) => artist.name),
            });

            activeCallbacks.onStateChange?.(state);
        });

        newPlayer.addListener("autoplay_failed", () => {
            if (!isCurrentPlayer(newPlayer, generation)) return;

            warnSpotify(
                "Playback activation failed due to browser autoplay restrictions."
            );
        });

        logSpotify("Calling player.connect().");

        const connected = await newPlayer.connect();

        logSpotify("player.connect() completed.", { connected });

        // Cleanup may have happened while connect() was pending.
        if (!isCurrentPlayer(newPlayer, generation)) {
            warnSpotify("Player became stale during connection; disconnecting.");
            newPlayer.disconnect();

            throw new Error("Spotify player initialization was cancelled.");
        }

        if (!connected) {
            warnSpotify("Player connection failed.");

            newPlayer.disconnect();

            if (player === newPlayer) {
                player = null;
                playerGeneration = null;
                deviceId = null;
            }

            throw new Error("Could not connect to the Spotify player.");
        }

        return newPlayer;
    })();

    initializationPromise = promise;
    initializationGeneration = generation;

    try {
        return await promise;
    } catch (error) {
        errorSpotify("Player initialization failed.", error);
        throw error;
    } finally {
        // A stale promise must not clear a newer initialization.
        if (initializationPromise === promise) {
            initializationPromise = null;
            initializationGeneration = null;
        }
    }
};

export const getSpotifyPlayer = () => player;

export const activateSpotifyPlayer = async () => {
    logSpotify("Browser audio activation requested.", {
        hasPlayer: Boolean(player),
        deviceId,
    });

    if (!player) {
        const error = new Error("Spotify player is not initialized.");
        errorSpotify("Cannot activate player:", error.message);
        throw error;
    }

    try {
        await player.activateElement();
        logSpotify("Browser audio activation completed.");
    } catch (error) {
        errorSpotify("Browser audio activation failed.", error);
        throw error;
    }
};

export const disconnectSpotifyPlayer = () => {
    logSpotify("Disconnect requested.", {
        hasPlayer: Boolean(player),
        deviceId,
        hasInitializationPromise: Boolean(initializationPromise),
        lifecycleGeneration,
    });

    // Invalidate in-flight initialization and events from the old player.
    lifecycleGeneration += 1;

    const playerToDisconnect = player;

    player = null;
    playerGeneration = null;
    deviceId = null;
    initializationPromise = null;
    initializationGeneration = null;

    if (playerToDisconnect) {
        playerToDisconnect.disconnect();
    }

    logSpotify("Disconnect completed.", {
        hasPlayer: Boolean(player),
        deviceId,
        lifecycleGeneration,
    });
};

export const playSpotifyTrack = async (trackId) => {
    const targetDeviceId = deviceId;

    logSpotify("Track playback requested.", {
        trackId,
        deviceId: targetDeviceId,
        hasPlayer: Boolean(player),
    });

    if (!targetDeviceId || !player) {
        const error = new Error("Spotify player is not ready yet.");
        errorSpotify("Cannot play track:", error.message);
        throw error;
    }

    if (!trackId) {
        const error = new Error("A Spotify track ID is required.");
        errorSpotify("Cannot play track:", error.message);
        throw error;
    }

    const accessToken = await getSpotifyAccessToken();

    logSpotify("Access token retrieved for playback request.");

    const devicesResponse = await fetch(
        "https://api.spotify.com/v1/me/player/devices",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const devicesData = await devicesResponse.json().catch(() => ({}));

    logSpotify("Spotify devices response.", {
        status: devicesResponse.status,
        ok: devicesResponse.ok,
        devices: devicesData.devices?.map((device) => ({
            name: device.name,
            id: device.id,
            type: device.type,
            is_active: device.is_active,
            is_restricted: device.is_restricted,
        })),
    });

    if (!devicesResponse.ok) {
        throw new Error(
            `Spotify device list failed (${devicesResponse.status}): ${
                devicesData.error?.message ||
                devicesData.error ||
                "Unknown error"
            }`
        );
    }

    logSpotify("Requesting playback transfer to Echo.", {
        deviceId: targetDeviceId,
    });

    const transferResponse = await fetch(
        "https://api.spotify.com/v1/me/player",
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                device_ids: [targetDeviceId],
                play: false,
            }),
        }
    );

    logSpotify("Playback transfer response.", {
        status: transferResponse.status,
        ok: transferResponse.ok,
    });

    if (!transferResponse.ok) {
        const data = await transferResponse.json().catch(() => ({}));

        errorSpotify("Playback transfer failed.", {
            status: transferResponse.status,
            error: data.error,
        });

        throw new Error(
            `Spotify device transfer failed (${transferResponse.status}): ${
                data.error?.message || "Unknown error"
            }`
        );
    }

    logSpotify("Requesting track playback.", {
        trackId,
        deviceId: targetDeviceId,
    });

    const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(targetDeviceId)}`,
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

    logSpotify("Track playback response.", {
        status: response.status,
        ok: response.ok,
        error: data.error,
    });

    if (!response.ok) {
        errorSpotify("Track playback request failed.", {
            status: response.status,
            error: data.error,
        });

        throw new Error(
            `Spotify playback failed (${response.status}): ${
                data.error?.message || "Unknown error"
            }`
        );
    }

    logSpotify("Spotify accepted the track playback request.", {
        trackId,
        deviceId: targetDeviceId,
    });

    schedulePlaybackDiagnostics("After Play");
};


export const pauseSpotifyPlayback = async () => {
    logSpotify("Pause requested via Spotify SDK.", {
        hasPlayer: Boolean(player),
        deviceId,
    });

    if (!player) {
        throw new Error("Spotify player is not initialized.");
    }

    if (!deviceId) {
        throw new Error("Spotify player device is not ready.");
    }

    await player.pause();

    logSpotify("SDK pause command completed.");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await logSpotifyWebPlayback("Pause verification");

    schedulePlaybackDiagnostics("After Pause", [500, 1500]);
};


export const resumeSpotifyPlayback = async () => {
    logSpotify("Resume requested.", {
        hasPlayer: Boolean(player),
        deviceId,
    });

    if (!player) {
        throw new Error("Spotify player is not initialized.");
    }

    await player.resume();

    logSpotify("Resume command completed.");
};

export const seekSpotifyPlayback = async (positionMs) => {
    logSpotify("Seek requested.", {
        positionMs,
        hasPlayer: Boolean(player),
        deviceId,
    });

    if (!player) {
        throw new Error("Spotify player is not initialized.");
    }

    await player.seek(positionMs);

    logSpotify("Seek command completed.", { positionMs });
};
