import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import { updateMemory } from "../store/slices/memoriesSlice";
import { saveImage } from "../utils/imageStorage";
import { isMemoryOwner } from "../utils/memoryUtils";
import { useAuth } from "../hooks/useAuth";
import useImage from "../hooks/useImage";
import MemoryForm from "../components/memory/MemoryForm";

function EditMemory(){
    const { id } = useParams();
    const { user } = useAuth();

    const dispatch = useDispatch();
    const navigate= useNavigate();

    const { memories } = useSelector(
        (state) => state.memories
    );

    const memory = memories.find(
        (memory) => memory.id === Number(id)
    );

    const isOwner = isMemoryOwner(memory, user);

    const { imageUrl, isLoading} = useImage(memory?.image);

    if (!memory){
        return(
            <div className="px-8 py-12 text-center">
                <h1 className="text-3xl font-bold">
                    Memory not found
                </h1>

                <p className="mt-3 text-zinc-400">
                    The memory you're trying to edit doesn't exist.
                </p>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="px-8 py-12 text-center">
                <h1 className="text-3xl font-bold">
                    Access denied
                </h1>

                <p className="mt-3 text-zinc-400">
                    You can only edit your own memories.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="px-8 py-12 text-center text-zinc-400">
                Loading memory...
            </div>
        );
    }


    const handleEdit = async ({imageFile, selectedMood, caption, selectedSong, existingImage}) => {
        let image = existingImage;

        if (imageFile) {
            await saveImage(memory.id, imageFile);

            image = {
                type: "indexeddb",
                id: memory.id
            };
        }

        const updatedMemory = {
            ...memory,
            image,
            mood: selectedMood,
            caption,
            song: selectedSong
        };

        dispatch(updateMemory(updatedMemory));

        navigate("/feed");
    };

    return(
        <section className="px-8 py-12 md:py-16">
            <div className="mx-auto max-w-3xl">

                <h1 className="text-4xl font-bold">
                    Edit Memory
                </h1>

                <p className="mt-2 text-zinc-400">
                    Update your moment and its soundtrack.
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
                    <MemoryForm
                        initialMemory={memory}
                        initialImagePreview={imageUrl}
                        submitLabel="Save Changes"
                        onSubmit={handleEdit}
                    />
                </div>

            </div>
        </section>
    );

}

export default EditMemory;