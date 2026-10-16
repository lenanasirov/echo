import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    initializeSpotifyPlayer,
    disconnectSpotifyPlayer,
    playSpotifyTrack,
    pauseSpotifyPlayback,
    resumeSpotifyPlayback,
    seekSpotifyPlayback
} from "../../services/spotifyPlayerService";
import SpotifyPlayerContext from "./SpotifyPlayerContext";

export function SpotifyPlayerProvider({ children }) {
    const [deviceId, setDeviceId] = useState(null);
    const [playerState, setPlayerState] = useState(null);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [status, setStatus] = useState("connecting");

    const handleError = useCallback((playerError) => {
        setError(playerError.message);
        setStatus("error");
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                await initializeSpotifyPlayer({
                    onReady: (id) => {
                        if (!isMounted) return;

                        setDeviceId(id);
                        setIsReady(true);
                        setError(null);
                        setStatus("ready");
                    },
                    onNotReady: () => {
                        if (!isMounted) return;

                        setIsReady(false);
                        setDeviceId(null);
                        setStatus("disconnected");
                    },
                    onStateChange: (state) => {
                        if (!isMounted) return;

                        setPlayerState(state);
                    },
                    onError: handleError,
                });

            } catch (playerError) {
                if (isMounted) {
                    setError(playerError.message);
                    setStatus("error");
                }
            }
        };

        initialize();

        return () => {
            isMounted = false;
            disconnectSpotifyPlayer();
        };
    }, [handleError]);

    const playTrack = useCallback(async (trackId) => {
        await playSpotifyTrack(trackId);
    }, []);
    
    const pause = useCallback(async () => {
        await pauseSpotifyPlayback();
    }, []);
    
    const resume = useCallback(async () => {
        await resumeSpotifyPlayback();
    }, []);

    
    const seek = useCallback(async (positionMs) => {
        await seekSpotifyPlayback(positionMs);
    }, []);


    const value = {
        deviceId,
        playerState,
        isReady,
        error,
        status,
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

