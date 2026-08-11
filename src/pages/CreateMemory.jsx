import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { saveImage } from "../utils/imageStorage";
import { addMemory } from "../store/slices/memoriesSlice";
import { useAuth } from "../hooks/useAuth";
import MemoryForm from "../components/memory/MemoryForm";

function CreateMemory() {
    const dispatch = useDispatch();
    const navigate= useNavigate();

    const { user } = useAuth();

    const handleCreate= async ({imageFile, selectedMood, caption, selectedSong}) => {
        const memoryId = Date.now();

        await saveImage(memoryId, imageFile);

        const newMemory = {
            id: memoryId,

            user: {
                id: user.id,
                name: user.name,
                avatar: user.avatar
            },

            image: {
                type: "indexeddb",
                id: memoryId
            },

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

        dispatch(addMemory(newMemory));

        navigate("/feed");
    };

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

                    <MemoryForm submitLabel="Save Memory" onSubmit={handleCreate} />

                </div>                      
                                
            </div>            

        </section>
    );
}

export default CreateMemory;