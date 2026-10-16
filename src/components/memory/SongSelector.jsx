import { useState, useCallback, useRef, useEffect } from "react";
import { FiCheck, FiPlus, FiSearch, FiPlay, FiPause, FiLoader } from "react-icons/fi";
import useSpotifyPlayer from "../spotify/useSpotifyPlayer";
import SpotifyPlaybackProgress from "../spotify/SpotifyPlaybackProgress";
import api from "../../services/api";


function SongSelector({ selectedSong, setSelectedSong }) {
    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const {
        isReady,
        playerState,
        playTrack,
        pause,
        resume,
    } = useSpotifyPlayer();

    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [playbackError, setPlaybackError] = useState("");
    const [isStartingTrack, setIsStartingTrack] = useState(false);

    const currentTrackId = playerState?.track_window?.current_track?.id;
    const isPlaying = playerState !== null && !playerState.paused;

    const timeoutRef = useRef(null);
    const requestIdRef = useRef(0);

    const handleSearchChange = useCallback((value) => {
        setQuery(value);

        clearTimeout(timeoutRef.current);

        const requestId = ++requestIdRef.current;
        const searchQuery = value.trim();

        setSongs([]);
        setError("");
        setHasSearched(false);
        setIsLoading(false);

        if (!searchQuery) {
            return;
        }

        timeoutRef.current = setTimeout(async () => {
            setIsLoading(true);

            try {
                const response = await api.get("/spotify/search", {
                    params: {
                        q: searchQuery
                    }
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
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
            requestIdRef.current += 1;
        };
    }, []);

    const handlePlayback = async(event, song) => {
        event.stopPropagation();

        setPlaybackError("");

        if(!isReady) {
            setPlaybackError("Spotify player is not ready yet.");
            return;
        }

        try{
            if(currentTrackId === song.id  && isPlaying) {
                await pause();
                return;
            }

            if(currentTrackId === song.id && playerState?.paused) {
                await resume();
                return;
            }

            setIsStartingTrack(true);
            setPlayingTrackId(song.id);
            await playTrack(song.id);
        } catch (err) {
            setPlaybackError(
                err.message || "Couldn't start spotify playback.");
        } finally {
            setIsStartingTrack(false);
        }
    }

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

            {isLoading && (
                <p className="py-4 text-center text-sm text-zinc-400">
                    Searching Spotify...
                </p>
            )}

            {error && (
                <p role="alert" className="text-sm text-red-400">
                    {error}
                </p>
            )}

            {playbackError && (
                <p role="alert" className="text-sm text-red-400">
                    {playbackError}
                </p>
            )}

            {!isLoading && hasSearched && !error && songs.length === 0 && (
                <p className="py-4 text-center text-sm text-zinc-400">
                    No songs found. Try another search.
                </p>
            )}

            {!isLoading && songs.length > 0 && (
                <div className="space-y-3">
                    
                    {songs.map((song) => {
                        const isSelected = selectedSong?.id === song.id;
                        const isCurrentTrack = currentTrackId === song.id;
                        const isTrackPlaying = isCurrentTrack && isPlaying;
                        const isThisTrackStarting = 
                            isStartingTrack && playingTrackId === song.id;

                        return (
                            <div
                                key={song.id}
                                className={`
                                    rounded-2xl border p-3 pb-2 transition
                                    ${
                                        isSelected
                                            ? "border-purple-500 bg-purple-500/10"
                                            : "border-white/10 bg-black/20 hover:border-purple-500/50"
                                    }
                                `}
                            >

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSong(isSelected ? null : song)}
                                        aria-pressed={isSelected}
                                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                    >
                                        {song.albumArtUrl ? (
                                            <img
                                                src={song.albumArtUrl}
                                                alt=""
                                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 shrink-0 rounded-lg bg-zinc-800" />
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-semibold">{song.title}</h3>
                                            <p className="truncate text-sm text-zinc-400">
                                                {song.artist}
                                            </p>
                                        </div>

                                    </button>

                                    <button
                                        type="button"
                                        onClick={(event) => handlePlayback(event, song)}
                                        disabled={!isReady || isThisTrackStarting}
                                        aria-label={
                                            isTrackPlaying
                                                ? `Pause ${song.title}`
                                                : `Play ${song.title}`
                                        }
                                        className="
                                            flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                                            border border-white/10 bg-white/5 text-white
                                            transition hover:border-purple-500 hover:bg-purple-500/20
                                            disabled:cursor-not-allowed disabled:opacity-40
                                        "
                                    >
                                        {isThisTrackStarting ? (
                                            <FiLoader className="animate-spin" size={16} />
                                        ) : isTrackPlaying ? (
                                            <FiPause size={16} />
                                        ) : (
                                            <FiPlay size={16} />
                                        )}
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() => setSelectedSong(isSelected ? null : song)}
                                        aria-label={isSelected ? `Deselect ${song.title}` : `Choose ${song.title}`}
                                        aria-pressed={isSelected}
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition
                                            ${
                                            isSelected
                                                ? "border-purple-500 bg-purple-950/70 text-purple-300"
                                                : "border-purple-500/70 bg-transparent text-purple-400 hover:border-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                                            }`}
                                    >
                                        {isSelected ? <FiCheck size={16} /> : <FiPlus size={16} />}
                                    </button>
                                </div>

                                {isCurrentTrack && (
                                    <div className="mt-1">
                                        <SpotifyPlaybackProgress />
                                    </div>
                                )}
     
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedSong && (
                <p className="text-sm text-zinc-400">
                    Selected:{" "}
                    <span className="text-white">
                        {selectedSong.title}
                    </span>
                    {" — "}
                    {selectedSong.artist}
                </p>
            )}
        </div>
    );
}

export default SongSelector;


