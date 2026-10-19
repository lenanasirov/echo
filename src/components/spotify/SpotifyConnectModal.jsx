import { useState } from "react";
import { FiMusic, FiX } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";

function SpotifyConnectModal({
    isOpen,
    onClose,
    song,
    onConnect,
}) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) {
        return null;
    }

    const handleConnect = async () => {
        setIsConnecting(true);
        setError("");

        try {
            await onConnect();
        } catch (err) {
            setError(
                err.message || "Couldn't connect to Spotify. Please try again."
            );
            setIsConnecting(false);
        }
    };

    const handleClose = () => {
        if (isConnecting) {
            return;
        }

        setError("");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="spotify-connect-title"
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1DB954]/10 text-[#1DB954]">
                        <FiMusic size={22} />
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isConnecting}
                        aria-label="Close modal"
                        className="text-zinc-400 transition hover:text-white disabled:opacity-50"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <h2
                    id="spotify-connect-title"
                    className="text-lg font-semibold text-white"
                >
                    Connect Spotify to listen
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    Connect your Spotify account to play songs directly in Echo.
                </p>

                {song && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-black/20 p-3">
                        {song.albumArtUrl && (
                            <img
                                src={song.albumArtUrl}
                                alt=""
                                className="h-11 w-11 shrink-0 rounded-lg object-cover"
                            />
                        )}

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                                {song.title}
                            </p>
                            <p className="truncate text-xs text-zinc-400">
                                {song.artist}
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="mt-3 text-sm text-red-400" role="alert">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        disabled={isConnecting}
                        onClick={handleConnect}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1DB954] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FaSpotify size={20} />
                        {isConnecting ? "Connecting..." : "Connect to Spotify"}
                    </button>

                    <button
                        type="button"
                        disabled={isConnecting}
                        onClick={handleClose}
                        className="w-full rounded-full border border-white/10 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpotifyConnectModal;