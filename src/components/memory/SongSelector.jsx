import { FiCheck } from "react-icons/fi";
import songs from "../../data/mockSongs";

function SongSelector({ selectedSong, setSelectedSong }) {
    return (
        <div
            className="
                mt-3
                space-y-3
        ">

            {songs.map((song) => (
                
                <button
                    key={song.id} 
                    type="button"
                    onClick={() => setSelectedSong(song)}
                    className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition

                        ${
                            selectedSong?.id === song.id
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/10 bg-black/20 hover:border-purple-500/50"
                        }
                    `}                       
                >

                    <div>
                        <h3 className="font-semibold">
                            {song.title}
                        </h3>

                        <p className="text-zinc-400">
                            {song.artist}
                        </p>
                    </div>
                    
                    {selectedSong?.id === song.id && (
                        <div
                            className="
                                flex
                                h-6
                                w-6
                                items-center
                                justify-center
                                rounded-full
                                bg-purple-500
                                text-white
                            "
                        >
                            <FiCheck size={14} />
                        </div>
                    )}

                </button>
            ))}

        </div>
    );
}

export default SongSelector;