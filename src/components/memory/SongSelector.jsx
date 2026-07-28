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
                    onClick={() => setSelectedSong(song)}
                    className={`
                        w-full
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition

                        ${
                            selectedSong?.id === song.id
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/10 bg-black/20 hover:border-purple-500"
                        }
                    `}                       
                >

                    <h3
                        className="
                            font-semibold
                        "
                    >                    
                        {song.title}
                    </h3>

                    <p
                        className="
                            text-zinc-400
                        "                    
                    >
                        {song.artist}
                    </p>

                </button>
            ))}

        </div>
    );
}

export default SongSelector;