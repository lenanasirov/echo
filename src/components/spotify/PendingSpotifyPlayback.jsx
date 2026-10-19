
import { useEffect, useRef, useState } from "react";
import useSpotifyPlayer from "./useSpotifyPlayer";
import { activateSpotifyPlayer } from "../../services/spotifyPlayerService";
import {
    consumePendingSpotifyPlayback,
} from "../../services/spotifyAuthService";

function PendingSpotifyPlayback() {
    const { isConnected, isReady, playTrack } = useSpotifyPlayer();

    const [error, setError] = useState("");
    const pendingTrackRef = useRef(null);
    const hasConsumedRequest = useRef(false);
    const hasAttemptedPlayback = useRef(false);

    useEffect(() => {
        if (!isConnected || hasConsumedRequest.current) {
            return;
        }

        hasConsumedRequest.current = true;
        pendingTrackRef.current = consumePendingSpotifyPlayback();
    }, [isConnected]);

    useEffect(() => {
        const track = pendingTrackRef.current;

        if (
            !track?.id ||
            !isConnected ||
            !isReady ||
            hasAttemptedPlayback.current
        ) {
            return;
        }

        hasAttemptedPlayback.current = true;

        const startPlayback = async () => {
            try {
                await activateSpotifyPlayer();
                await playTrack(track.id);
            } catch (playbackError) {
                console.error(
                    "[Echo Spotify] Automatic playback failed:",
                    playbackError
                );

                setError(
                    "Spotify connected, but playback couldn't start automatically. Try pressing Play again."
                );
            } finally {
                pendingTrackRef.current = null;
            }
        };

        startPlayback();
    }, [isConnected, isReady, playTrack]);

    if (!error) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-red-500/20 bg-zinc-900 px-4 py-3 text-sm text-red-400 shadow-lg"
        >
            {error}
        </div>
    );
}

export default PendingSpotifyPlayback;
