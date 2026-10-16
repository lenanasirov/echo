import useSpotifyPlayer from "./useSpotifyPlayer";

function SpotifyPlayerStatus() {
    const { status, deviceId, error } = useSpotifyPlayer();

    const labels = {
        connecting: "Connecting to Spotify...",
        ready: "Spotify player ready",
        disconnected: "Spotify player disconnected",
        error: "Spotify player error",
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm shadow-lg">
            <p className="font-medium text-white">
                {labels[status] ?? "Spotify status unknown"}
            </p>

            {status === "ready" && deviceId && (
                <p className="mt-1 break-all text-xs text-zinc-400">
                    Device: {deviceId}
                </p>
            )}

            {error && (
                <p className="mt-1 break-words text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

export default SpotifyPlayerStatus;
