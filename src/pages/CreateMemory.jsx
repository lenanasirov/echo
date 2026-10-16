import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { useState } from "react";

import { createMemory } from "../store/slices/memoriesSlice";

import { useAuth } from "../hooks/useAuth";

import MemoryForm from "../components/memory/MemoryForm";

import useSpotifyPlayer from "../components/spotify/useSpotifyPlayer";

function CreateMemory() {
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const [error, setError] = useState("");

    const { user, updateStreak } = useAuth();

    const { cycle } = useSelector(
        (state) => state.echoCycle
    );

    const { pause } = useSpotifyPlayer();

    const handleCreate = async ({
        imageFile,
        selectedMood,
        caption,
        selectedSong
    }) => {
        setError("");

        if (!cycle) {
            setError(
                "Couldn't save your Echo. Please check your connection and try again."
            );
            return;
        }

        const memoryId = Date.now();

        const newMemory = {
            id: memoryId,
            cycleId: cycle.id,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                avatar: user.avatar
            },
            imageFile,
            song: selectedSong,
            mood: selectedMood,
            caption,
            location: "Ashdod, Israel",
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            comments: []
        };

        await dispatch(createMemory(newMemory)).unwrap();

        try {
            await pause();
        } catch (error) {
            console.error("Failed to pause Spotify playback:", error);
        }
        
        updateStreak(cycle);
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