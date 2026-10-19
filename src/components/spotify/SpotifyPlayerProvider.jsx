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
    isSpotifyConnected,
    startSpotifyAuthorization,
    disconnectSpotify as clearSpotifyConnection,
} from "../../services/spotifyAuthService";
import SpotifyPlayerContext from "./SpotifyPlayerContext";

export function SpotifyPlayerProvider({ children }) {
    const [deviceId, setDeviceId] = useState(null);
    const [playerState, setPlayerState] = useState(null);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [status, setStatus] = useState(
        () => isSpotifyConnected() ? "connecting" : "disconnected"
    );
    const [isConnected, setIsConnected] = useState(
        () => isSpotifyConnected()
    );

    const location = useLocation();
    const previousPathname = useRef(location.pathname);

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
        clearSpotifyConnection();
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
