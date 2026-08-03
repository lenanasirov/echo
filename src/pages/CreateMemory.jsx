import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { addMemory } from "../store/slices/memoriesSlice";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/common/Button";
import SongSelector from "../components/memory/SongSelector";

function CreateMemory() {
    const dispatch = useDispatch();

    const { user } = useAuth();

    const navigate= useNavigate();

    const [selectedMood, setSelectedMood] = useState("");
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);

    const canSave = image && selectedMood && selectedSong;

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        if(!image || !selectedMood || !selectedSong){
            return;
        }
        

        const newMemory = {
            id: Date.now(),
            user: {
                name: user.name,
                avatar: user.avatar
            },
            image,
            song: selectedSong,
            mood: selectedMood,
            caption,
            location: "Ashdod, Israel",
            date: new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            }),
            likes: 0,
            comments: 0
        };

        // setMemories([
        //     newMemory, 
        //     ...memories
        // ]);;

        dispatch(addMemory(newMemory));
        
        setImage(null);
        setSelectedSong(null);
        setSelectedMood("");
        setCaption("");

        navigate("/feed");
    };

    const moods = [
                "😊 Happy",
                "🌙 Nostalgic",
                "🔥 Energetic",
                "💙 Calm"
    ];

    return (
        <section
            className="
                px-8
                py-12
                md:py-16
            "
        >
            <div
                className="
                    mx-auto
                    max-w-3xl
                "
            >

                <h1
                    className="
                        text-4xl
                        font-bold
                    "
                >
                    Create a Memory
                </h1>

                <p
                    className="
                        mt-2
                        text-zinc-400
                    "
                >
                    Capture a moment and give it a soundtrack.
                </p>     

                <div
                    className="
                        mt-10
                        rounded-3xl
                        border
                        border-white/10
                        bg-[#15151D]
                        p-8
                    "
                >

                <label
                    className="
                        flex
                        h-72
                        cursor-pointer
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border
                        border-dashed
                        border-white/20
                        bg-black/20
                        transition
                        hover:border-purple-500
                    "
                >
                    {
                        image ? (
                            <img 
                                src={image}
                                alt="Preview"
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                "

                            />
                        ) : (
                            <div
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    text-zinc-400
                                "
                            >
                                <span className="text-5xl">
                                    📸
                                </span>

                                <span className="mt-3">
                                    Add a photo
                                </span>
                            </div>
                        )
                    }

                    <input 
                        type="file"
                        accept="image/"
                        onChange={handleImageChange}
                        className="hidden"
                    />

                </label> 

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Song
                        </label>

                        <SongSelector selectedSong={selectedSong} setSelectedSong={setSelectedSong} />

                    </div>

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Mood
                        </label>


                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                gap-3
                            "
                        >

                            {moods.map((mood) => (

                                <button
                                    onClick={() => setSelectedMood(mood)}
                                    key={mood}
                                    className={`
                                        rounded-full
                                        px-4
                                        py-2
                                        text-sm
                                        transition

                                        ${
                                            selectedMood === mood
                                            ? "bg-purple-500 text-white"
                                            : "border border-white/10 text-zinc-300 hover:border-purple-500"
                                        }
                                    `}
                                >
                                    {mood}
                                </button>

                            ))}

                        </div>

                    </div>

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Your thought
                        </label>


                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="What makes this moment special?"
                            maxLength={150}
                            className="
                                mt-3
                                h-32
                                w-full
                                resize-none
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-4
                                text-white
                                placeholder:text-zinc-500
                                outline-none
                                transition
                                focus:border-purple-500
                            "
                        />

                        <div
                            className="
                                mt-2
                                text-right
                                text-sm
                                text-zinc-500
                            "
                        >
                            {caption.length}/150
                        </div>

                    </div>

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Location
                        </label>


                        <div
                            className="
                                mt-3
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-4
                                text-zinc-300
                            "
                        >

                            <span>
                                📍
                            </span>

                            <span>
                                Ashdod, Israel
                            </span>

                        </div>

                    </div>

                    <div
                        className="
                            mt-10
                            flex
                            justify-end
                        "
                    >

                        <Button onClick={handleSave} disabled={!canSave}>
                            Save Memory
                        </Button>

                    </div>     

                </div>                      
                                
            </div>            

        </section>
    );
}

export default CreateMemory;