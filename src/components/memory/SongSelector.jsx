
import { useState, useCallback, useRef, useEffect } from "react";
import {
    FiCheck,
    FiPlus,
    FiSearch,
    FiPlay,
    FiPause,
    FiLoader
} from "react-icons/fi";

import useSpotifyPlayer from "../spotify/useSpotifyPlayer";
import SpotifyPlaybackProgress from "../spotify/SpotifyPlaybackProgress";
import SpotifyConnectModal from "../spotify/SpotifyConnectModal";
import api from "../../services/api";
import { activateSpotifyPlayer } from "../../services/spotifyPlayerService";
import { 
    savePendingSpotifyPlayback,
    consumePendingSpotifyPlayback
} from "../../services/spotifyAuthService";

function SongSelector({ selectedSong, setSelectedSong }) {
    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const {
        isConnected,
        isReady,
        playerState,
        playTrack,
        pause,
        resume,
        connectSpotify,
    } = useSpotifyPlayer();

    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [playbackError, setPlaybackError] = useState("");
    const [isStartingTrack, setIsStartingTrack] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [pendingSong, setPendingSong] = useState(null);
    const [pendingPlaybackTrack, setPendingPlaybackTrack] = useState(null);
    const hasAttemptedPendingPlayback = useRef(false);

    const currentTrackId = playerState?.track_window?.current_track?.id;
    const isPlaying = playerState !== null && !playerState.paused;

    const timeoutRef = useRef(null);
    const requestIdRef = useRef(0);

    const handleSearchChange = useCallback((value) => {
        setQuery(value);
        setSongs([]);
        setError("");
        setHasSearched(false);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const searchQuery = query.trim();
    
        if (!searchQuery) {
            return;
        }
    
        const requestId = ++requestIdRef.current;
    
        timeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
    
            try {
                const response = await api.get("/spotify/search", {
                    params: { q: searchQuery },
                });
    
                if (requestId === requestIdRef.current) {
                    setSongs(response.data.data);
                    setHasSearched(true);
                }
            } catch (err) {
                if (requestId === requestIdRef.current) {
                    setSongs([]);
                    setError(
                        err.response?.data?.message ||
                            "Couldn't search Spotify. Please try again."
                    );
                    setHasSearched(true);
                }
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsLoading(false);
                }
            }
        }, 350);
    
        return () => {
            clearTimeout(timeoutRef.current);
            requestIdRef.current += 1;
        };
    }, [query]);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
            requestIdRef.current += 1;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
    
        const restorePendingPlayback = async () => {
            const pendingPlayback = consumePendingSpotifyPlayback();
    
            if (!pendingPlayback || cancelled) {
                return;
            }
    
            if (pendingPlayback.searchQuery) {
                setQuery(pendingPlayback.searchQuery);
            }
    
            setPendingPlaybackTrack(pendingPlayback);
        };
    
        restorePendingPlayback();
    
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (
            !pendingPlaybackTrack ||
            !isConnected ||
            !isReady ||
            hasAttemptedPendingPlayback.current
        ) {
            return;
        }
    
        hasAttemptedPendingPlayback.current = true;
    
        const resumePendingPlayback = async () => {
            try {
                await activateSpotifyPlayer();
                await playTrack(pendingPlaybackTrack.id);
            } catch (error) {
                console.error(
                    "Failed to resume pending Spotify playback:",
                    error
                );
                setPlaybackError(
                    "Spotify is connected, but playback couldn't start automatically. Try pressing Play again."
                );
            } finally {
                setPendingPlaybackTrack(null);
            }
        };
    
        resumePendingPlayback();
    }, [
        pendingPlaybackTrack,
        isConnected,
        isReady,
        playTrack,
    ]);

    const handlePlayback = async (event, song) => {
        event.stopPropagation();

        console.log("[Echo Spotify] SongSelector: Play button clicked", {
            songId: song.id,
            title: song.title,
            artist: song.artist,
            isReady,
            currentTrackId,
            isPlaying,
            playerPaused: playerState?.paused ?? null
        });

        setPlaybackError("");

        if (!isConnected) {
            setPendingSong(song);
            setIsConnectModalOpen(true);
            return;
        }

        if (!isReady) {
            console.warn(
                "[Echo Spotify] SongSelector: Player is not ready; playback skipped"
            );
            setPlaybackError("Spotify player is not ready yet.");
            return;
        }

        try {
            if (currentTrackId === song.id && isPlaying) {
                console.log(
                    "[Echo Spotify] SongSelector: Current track is playing; pausing"
                );

                await pause();

                console.log(
                    "[Echo Spotify] SongSelector: Pause request completed"
                );
                return;
            }

            if (currentTrackId === song.id && playerState?.paused) {
                console.log(
                    "[Echo Spotify] SongSelector: Current track is paused; resuming"
                );

                await resume();

                console.log(
                    "[Echo Spotify] SongSelector: Resume request completed"
                );
                return;
            }

            // Activate audio directly from the user's click, before async playback flow.
            console.log(
                "[Echo Spotify] SongSelector: Starting audio activation"
            );

            const activationPromise = activateSpotifyPlayer();

            setIsStartingTrack(true);
            setPlayingTrackId(song.id);

            await activationPromise;

            console.log(
                "[Echo Spotify] SongSelector: Audio activation completed; calling playTrack",
                { songId: song.id }
            );

            await playTrack(song.id);

            console.log(
                "[Echo Spotify] SongSelector: playTrack completed",
                { songId: song.id }
            );
        } catch (err) {
            console.error(
                "[Echo Spotify] SongSelector: Playback failed",
                err
            );

            setPlaybackError(
                err.message || "Couldn't start Spotify playback."
            );
        } finally {
            setIsStartingTrack(false);
        }
    };

    const handleConnectSpotify = async () => {
        if (!pendingSong) {
            return;
        }
    
        savePendingSpotifyPlayback({
            ...pendingSong,
            searchQuery: query,
        });
    
        await connectSpotify();
    };

    return (
        <div className="mt-3 space-y-3">
            <div className="relative">
                <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    size={18}
                />

                <input
                    type="text"
                    value={query}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search songs or artists..."
                    maxLength={100}
                    className="
                        w-full rounded-xl border border-white/10
                        bg-black/20 py-3 pl-10 pr-3 text-white
                        placeholder:text-zinc-500
                        focus:border-purple-500 focus:outline-none
                    "
                />
            </div>

            {playbackError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {playbackError}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-400">
                    <FiLoader className="animate-spin" size={16} />
                    Searching Spotify...
                </div>
            )}

            {error && (
                <p className="py-3 text-center text-sm text-red-400">
                    {error}
                </p>
            )}

            {!isLoading && !error && hasSearched && songs.length === 0 && (
                <p className="py-6 text-center text-sm text-zinc-400">
                    No songs found. Try another search.
                </p>
            )}

            {songs.length > 0 && (
                <div className="echo-scrollbar max-h-80 space-y-2 overflow-y-auto pr-1">
                    {songs.map((song) => {
                        const isSelected = selectedSong?.id === song.id;
                        const isCurrentTrack = currentTrackId === song.id;
                        const isThisTrackStarting =
                            isStartingTrack && playingTrackId === song.id;

                        return (
                            <div
                                key={song.id}
                                onClick={() => setSelectedSong(song)}
                                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                                    isSelected
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                }`}
                            >
                                {song.albumArtUrl ? (
                                    <img
                                        src={song.albumArtUrl}
                                        alt={`${song.albumName || song.title} album artwork`}
                                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                                        <FiSearch size={18} />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">
                                        {song.title}
                                    </p>
                                    <p className="truncate text-xs text-zinc-400">
                                        {song.artist}
                                    </p>

                                    {isCurrentTrack && (
                                        <SpotifyPlaybackProgress />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={(event) => handlePlayback(event, song)}
                                    disabled={(isConnected && !isReady) || isThisTrackStarting}
                                    aria-label={
                                        isCurrentTrack && isPlaying
                                            ? `Pause ${song.title}`
                                            : `Play ${song.title}`
                                    }
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isThisTrackStarting ? (
                                        <FiLoader className="animate-spin" size={16} />
                                    ) : isCurrentTrack && isPlaying ? (
                                        <FiPause size={16} />
                                    ) : (
                                        <FiPlay size={16} />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedSong(isSelected ? null : song);
                                    }}
                                    aria-pressed={isSelected}
                                    aria-label={
                                        isSelected
                                            ? `Remove ${song.title} selection`
                                            : `Select ${song.title}`
                                    }
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                                        isSelected
                                            ? "bg-purple-500 text-white"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                    }`}
                                >
                                    {isSelected ? (
                                        <FiCheck size={16} />
                                    ) : (
                                        <FiPlus size={16} />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedSong && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
                    <p className="mb-1 text-xs text-purple-300">
                        Selected song
                    </p>
                    <div className="flex items-center gap-3">
                        {selectedSong.albumArtUrl ? (
                            <img
                                src={selectedSong.albumArtUrl}
                                alt={`${selectedSong.albumName || selectedSong.title} album artwork`}
                                className="h-10 w-10 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                                <FiSearch size={16} />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                                {selectedSong.title}
                            </p>
                            <p className="truncate text-xs text-zinc-400">
                                {selectedSong.artist}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedSong(null)}
                            aria-label={`Remove ${selectedSong.title} selection`}
                            className="text-zinc-400 transition hover:text-white"
                        >
                            <FiPlus className="rotate-45" size={18} />
                        </button>
                    </div>
                </div>
            )}

            <SpotifyConnectModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                song={pendingSong}
                onConnect={handleConnectSpotify}
            />
        </div>
    );
}

export default SongSelector;
