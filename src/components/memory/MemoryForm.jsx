import { useState, useEffect } from "react";

import Button from "../common/Button";
import SongSelector from "../memory/SongSelector";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const moods = [
    "😊 Happy",
    "🌙 Nostalgic",
    "🔥 Energetic",
    "💙 Calm"
];

function MemoryForm({initialMemory = null, initialImagePreview = null, submitLabel="SaveMemory", onSubmit}) {
    const [selectedMood, setSelectedMood] = useState(initialMemory?.mood || "");
    const [caption, setCaption] = useState(initialMemory?.caption || "");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialImagePreview);
    const [imageError, setImageError] = useState("");
    const [selectedSong, setSelectedSong] = useState(initialMemory?.song || null);

    const canSave = (imageFile || initialMemory?.image) && selectedMood && selectedSong;

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);


    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        setImageError("");

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setImageError("Please select a JPG, PNG, or WebP image.");
            return;
        }
    
        if (file.size > MAX_IMAGE_SIZE) {
            setImageError("Image size must be less than 5MB.");
            return;
        }

        if ( imagePreview && imagePreview.startsWith("blob:") ) { 
            URL.revokeObjectURL(imagePreview); 
        }

        setImageFile(file);

        const previewUrl = URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if(!canSave){
            return;
        }

        onSubmit({
            imageFile,
            selectedMood,
            caption,
            selectedSong,
            existingImage: initialMemory?.image || null
        });
    }

    return(
        <form onSubmit={handleSubmit}>
            {/* Image */}
            <label
                className="
                    group
                    relative
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
                {imagePreview  ? (
                    <>
                        <img
                            src={imagePreview }
                            alt="Preview"
                            className="
                                h-full
                                w-full
                                object-cover
                                transition
                                duration-300
                                group-hover:scale-105
                            "
                        />

                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-black/40
                                opacity-0
                                transition
                                duration-300
                                group-hover:opacity-100
                            "
                        >
                            <span className="text-sm font-medium text-white">
                                Change photo
                            </span>
                        </div>
                    </>
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

                        <span className="mt-1 text-xs text-zinc-500">
                            JPG, PNG or WebP · Max 5MB
                        </span>
                    </div>
                )}

                <input 
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                />

            </label> 

            {imageError && (
                <p className="mt-3 text-sm text-red-400">
                    {imageError}
                </p>
            )}

            {/* Song */}

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

            {/* Mood */}

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
                            key={mood}
                            type="button"
                            onClick={() => setSelectedMood(mood)}
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

            {/* Caption */}

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

            {/* Location */}

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

            {/* Submit */}
            
            <div
                className="
                    mt-10
                    flex
                    flex-col
                    items-end
                    gap-3
                "
            >

                <Button
                    type="submit"
                    disabled={!canSave}
                >
                    {submitLabel}
                </Button>
                
            </div>
        </form>
    )

}

export default MemoryForm;