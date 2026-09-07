import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { useState } from "react";

import { saveImage } from "../utils/imageStorage";

import { createMemory } from "../store/slices/memoriesSlice";

import { useAuth } from "../hooks/useAuth";

import MemoryForm from "../components/memory/MemoryForm";

function CreateMemory() {
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const [error, setError] = useState("");

    const { user, updateStreak } = useAuth();

    const { cycle } = useSelector(
        (state) => state.echoCycle
    );

    const handleCreate = async ({
        imageFile,
        selectedMood,
        caption,
        selectedSong
    }) => {
        setError("");

        if (!cycle) {
            return;
        }

        const memoryId = Date.now();

        try {
            await saveImage(
                memoryId,
                imageFile
            );

            const newMemory = {
                id: memoryId,

                cycleId: cycle.id,

                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
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

                createdAt: new Date().toISOString(),

                likes: 0,

                likedBy: [],

                comments: []
            };

            // dispatch(addMemory(newMemory));

            await dispatch(
                createMemory(newMemory)
            ).unwrap();

            updateStreak(cycle);

            navigate("/feed");
        } catch (error) {
            console.error(
                "Failed to create memory:",
                error
            );

            setError(
                "Couldn't save your Echo. Please check your connection and try again."
            );
        }
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
                    <MemoryForm
                        submitLabel="Save Memory"
                        onSubmit={handleCreate}
                        error={error}
                    />
                </div>
            </div>
        </section>
    );
}

export default CreateMemory;