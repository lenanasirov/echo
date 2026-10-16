
import { useEffect, useState } from "react";
import useSpotifyPlayer from "./useSpotifyPlayer";

const formatTime = (milliseconds = 0) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function SpotifyPlaybackProgress() {
    const { playerState, seek } = useSpotifyPlayer();

    const [clock, setClock] = useState(0);
    const [draftPosition, setDraftPosition] = useState(null);
    const [pendingPosition, setPendingPosition] = useState(null);
    const [seekSent, setSeekSent] = useState(false);

    const track = playerState?.track_window?.current_track;
    const duration = playerState?.duration ?? 0;
    const basePosition = playerState?.position ?? 0;
    const isPaused = playerState?.paused ?? true;

    useEffect(() => {
        if (!playerState || isPaused || draftPosition !== null) {
            return;
        }

        const interval = setInterval(() => {
            setClock((value) => value + 1);
        }, 250);

        return () => clearInterval(interval);
    }, [playerState, isPaused, draftPosition]);

    useEffect(() => {
        if (
            pendingPosition === null ||
            !seekSent ||
            Math.abs(basePosition - pendingPosition) > 1500
        ) {
            return;
        }
    
        const timeout = setTimeout(() => {
            setPendingPosition(null);
            setDraftPosition(null);
            setSeekSent(false);
            setClock(0);
        }, 0);
    
        return () => clearTimeout(timeout);
    }, [basePosition, pendingPosition, seekSent]);

    useEffect(() => {
        if (pendingPosition === null || !seekSent) {
            return;
        }

        const timeout = setTimeout(() => {
            setPendingPosition(null);
            setDraftPosition(null);
            setSeekSent(false);
            setClock(0);
        }, 2500);

        return () => clearTimeout(timeout);
    }, [pendingPosition, seekSent]);

    if (!track) return null;

    const estimatedPosition = Math.min(
        basePosition + (isPaused ? 0 : clock * 250),
        duration
    );

    const position =
        draftPosition !== null
            ? draftPosition
            : pendingPosition !== null
                ? Math.min(
                    pendingPosition + (isPaused ? 0 : clock * 250),
                    duration
                )
                : estimatedPosition;

    const progress =
        duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

    const handleSeek = async (positionMs) => {
        const target = Math.max(0, Math.min(positionMs, duration));

        setDraftPosition(target);
        setPendingPosition(target);
        setSeekSent(false);
        setClock(0);

        try {
            await seek(target);
            setSeekSent(true);
        } catch (error) {
            console.error("Failed to seek Spotify playback:", error);
            setPendingPosition(null);
            setDraftPosition(null);
            setSeekSent(false);
        }
    };

    return (
        <div className="px-0 pb-0">
            <input
                type="range"
                min={0}
                max={duration || 1}
                step={250}
                value={Math.min(position, duration || 0)}
                onChange={(event) => {
                    setDraftPosition(Number(event.target.value));
                }}
                onPointerUp={(event) => {
                    void handleSeek(Number(event.currentTarget.value));
                }}
                onPointerCancel={() => {
                    setDraftPosition(null);
                }}
                onKeyUp={(event) => {
                    if (
                        ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                            event.key
                        )
                    ) {
                        void handleSeek(Number(event.currentTarget.value));
                    }
                }}
                aria-label="Playback position"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-purple-500"
                style={{
                    background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${progress}%, #3f3f46 ${progress}%, #3f3f46 100%)`,
                    touchAction: "pan-y",
                }}
            />

            <div className="mt-1 flex justify-between text-[11px] tabular-nums text-zinc-500">
                <span>{formatTime(position)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
}
