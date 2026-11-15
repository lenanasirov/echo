import {
    useCallback,
    useEffect,
    useState,
    useRef
} from "react";
import { useLocation } from "react-router-dom";
import {
    initializeSpotifyPlayer,
    disconnectSpotifyPlayer,
    playSpotifyTrack,
    pauseSpotifyPlayback,
    resumeSpotifyPlayback,
    seekSpotifyPlayback
} from "../../services/spotifyPlayerService";
import {
    getSpotifyConnectionStatus,
    getSpotifyAccessToken,
    resetSpotifyAccessToken,
    startSpotifyAuthorization,
    disconnectSpotifyAccount,
} from "../../services/spotifyAuthService";
import SpotifyPlayerContext from "./SpotifyPlayerContext";

export function SpotifyPlayerProvider({ children }) {
    const [deviceId, setDeviceId] = useState(null);
    const [playerState, setPlayerState] = useState(null);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);
    // Database connection state is asynchronous, not browser sessionStorage.
    const [status, setStatus] = useState("connecting");
    const [isConnected, setIsConnected] = useState(false);

    const location = useLocation();
    const previousPathname = useRef(location.pathname);

    useEffect(() => {
        let active = true;
        // A fresh provider instance must never inherit another Echo user's
        // token, including during a same-browser account switch.
        resetSpotifyAccessToken();

        const restoreSpotify = async () => {
            try {
                const connection = await getSpotifyConnectionStatus();
                if (!active) return;
                if (!connection.connected) {
                    setIsConnected(false);
                    setStatus("disconnected");
                    return;
                }

                // Confirm the stored authorization can actually supply a token
                // before the existing SDK initialization effect runs.
                await getSpotifyAccessToken();
                if (!active) return;
                setError(null);
                setStatus("connecting");
                setIsConnected(true);
            } catch (restoreError) {
                if (!active) return;
                setIsConnected(false);
                setIsReady(false);
                if (restoreError.code === "spotify_reauthorization_required") {
                    setStatus("disconnected");
                    setError(null);
                } else {
                    setStatus("error");
                    setError(restoreError.message || "Couldn't restore Spotify.");
                }
            }
        };
        restoreSpotify();

        return () => {
            active = false;
            resetSpotifyAccessToken();
            disconnectSpotifyPlayer();
        };
    }, []);

    const handleError = useCallback((playerError) => {
        console.error(
            "[Echo Spotify] Provider received player error:",
            playerError
        );

        setError(playerError.message);
        setStatus("error");
    }, []);

    useEffect(() => {
        let isMounted = true;

        if (!isConnected) {
            return () => {
                isMounted = false;
            };
        }

        console.info("[Echo Spotify] Provider effect started.");

        const initialize = async () => {
            console.info(
                "[Echo Spotify] Provider starting player initialization."
            );

            try {
                await initializeSpotifyPlayer({
                    onReady: (id) => {
                        console.info(
                            "[Echo Spotify] Provider received ready event.",
                            { deviceId: id, isMounted }
                        );

                        if (!isMounted) return;

                        setDeviceId(id);
                        setIsReady(true);
                        setError(null);
                        setStatus("ready");
                    },
                    onNotReady: (id) => {
                        console.warn(
                            "[Echo Spotify] Provider received not_ready event.",
                            { deviceId: id, isMounted }
                        );

                        if (!isMounted) return;

                        setIsReady(false);
                        setDeviceId(null);
                        setStatus("disconnected");
                    },
                    onStateChange: (state) => {
                        console.info(
                            "[Echo Spotify] Provider received state change.",
                            {
                                isMounted,
                                paused: state?.paused,
                                trackId:
                                    state?.track_window?.current_track?.id,
                                trackName:
                                    state?.track_window?.current_track?.name,
                            }
                        );

                        if (!isMounted) return;

                        setPlayerState(state);
                    },
                    onError: handleError,
                });

                console.info(
                    "[Echo Spotify] Provider initialization promise resolved.",
                    { isMounted }
                );
            } catch (playerError) {
                console.error(
                    "[Echo Spotify] Provider initialization failed.",
                    playerError
                );

                if (isMounted) {
                    setError(playerError.message);
                    setStatus("error");
                }
            }
        };

        initialize();

        return () => {
            console.warn(
                "[Echo Spotify] Provider effect cleanup; disconnecting player."
            );

            isMounted = false;
            disconnectSpotifyPlayer();
        };
    }, [handleError, isConnected]);

    const playTrack = useCallback(async (trackId) => {
        console.info(
            "[Echo Spotify] Provider playTrack called.",
            { trackId }
        );

        await playSpotifyTrack(trackId);
    }, []);

    const pause = useCallback(async () => {
        console.info("[Echo Spotify] Provider pause called.");

        await pauseSpotifyPlayback();
    }, []);

    useEffect(() => {
        if (previousPathname.current === location.pathname) {
            return;
        }
    
        const previousRoute = previousPathname.current;
        previousPathname.current = location.pathname;
    
        console.info("[Echo Spotify] Route changed; stopping playback.", {
            previousRoute,
            currentRoute: location.pathname,
        });
    
        pauseSpotifyPlayback().catch((error) => {
            console.error(
                "[Echo Spotify] Failed to stop playback after route change.",
                error
            );
        });
    }, [location.pathname]);

    const resume = useCallback(async () => {
        console.info("[Echo Spotify] Provider resume called.");

        await resumeSpotifyPlayback();
    }, []);

    const seek = useCallback(async (positionMs) => {
        console.info(
            "[Echo Spotify] Provider seek called.",
            { positionMs }
        );

        await seekSpotifyPlayback(positionMs);
    }, []);

    const connectSpotify = useCallback(async () => {
        const returnTo = `${location.pathname}${location.search}${location.hash}`;
        await startSpotifyAuthorization(returnTo);
    }, [location.pathname, location.search, location.hash]);
    
    const disconnect = useCallback(async () => {
        // Unlike Echo logout, an explicit Profile disconnect must revoke
        // the saved connection in MySQL. Do not report success if it fails.
        try {
            await disconnectSpotifyAccount();
        } catch (disconnectError) {
            setError(disconnectError.message);
            setStatus("error");
            throw disconnectError;
        }
        disconnectSpotifyPlayer();

        setIsConnected(false);
        setDeviceId(null);
        setPlayerState(null);
        setIsReady(false);
        setError(null);
        setStatus("disconnected");
    }, []);

    const value = {
        deviceId,
        playerState,
        isReady,
        error,
        status,
        isConnected,
        connectSpotify,
        disconnect,
        playTrack,
        pause,
        resume,
        seek,
    };

    return (
        <SpotifyPlayerContext.Provider value={value}>
            {children}
        </SpotifyPlayerContext.Provider>
    );
}
