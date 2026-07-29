import { useParams } from "react-router-dom";
import { useState } from "react";

import CommentsSection from "../components/memory/CommentsSection";

import {
    FiHeart,
    FiMessageCircle,
    FiMapPin
} from "react-icons/fi";


function MemoryDetails({ memories }) {
    const { id } = useParams();
    const [liked, setLiked] = useState(false);

    const handleLike = () => {
        setLiked(!liked)
    };

    const memory = memories.find(
        (memory) => memory.id === Number(id)
    );

    if(!memory){
        return(
            <div
                className="
                    px-8
                    py-12
                    text-center
                    text-zinc-400
                "
            >
                Memory not found.
            </div>
        )
    }

    return(
        <div
            className="
                mx-auto
                max-w-4xl
                px-8
                py-12
            "
        >

            {/* Image */}
            <div
                className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/10
                "
            >

                <img
                    src={memory.image}
                    alt={memory.caption}
                    className="
                        h-125
                        w-full
                        object-cover
                    "
                />

            </div>

            {/* User */}
            <div
                className="
                    mt-8
                    flex
                    items-center
                    gap-3
                "
            >

                <div
                    className="
                        text-3xl
                    "
                >
                    {memory.user.avatar}
                </div>


                <div>

                    <h2
                        className="
                            font-semibold
                        "
                    >
                        {memory.user.name}
                    </h2>


                    <p
                        className="
                            text-sm
                            text-zinc-500
                        "
                    >
                        {memory.date}
                    </p>

                </div>

            </div>

            {/* Caption */}
            <p
                className="
                    mt-8
                    text-xl
                    leading-relaxed
                "
            >
                {memory.caption}
            </p>            

            {/* Song */}
            <div
                className="
                    mt-8
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    p-5
                "
            >

                <p
                    className="
                        text-sm
                        text-zinc-400
                    "
                >
                    Playing now
                </p>


                <h3
                    className="
                        mt-2
                        text-lg
                        font-semibold
                    "
                >
                    🎵 {memory.song.title}
                </h3>


                <p
                    className="
                        text-zinc-400
                    "
                >
                    {memory.song.artist}
                </p>

            </div>

            {/* Extra information */}
            <div
                className="
                    mt-6
                    flex
                    flex-wrap
                    gap-4
                    text-sm
                    text-zinc-400
                "
            >

                <span>
                    {memory.mood}
                </span>


                <span
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >
                    <FiMapPin />
                    {memory.location}
                </span>

            </div>

            {/* Actions */}
            <div
                className="
                    mt-8
                    flex
                    gap-6
                    text-zinc-400
                "
            >

                <button
                    onClick={handleLike}
                    className="
                        flex
                        items-center
                        gap-2
                        transition
                        hover:text-white
                    "
                >
                    <FiHeart 
                        className={`
                            transition
                            duration-200  
                            ${liked ? "scale-125 fill-pink-500 text-pink-500" : ""}
                        `}
                    />
                    {memory.likes + (liked ? 1 : 0)}
                </button>


                <button
                    className="
                        flex
                        items-center
                        gap-2
                        transition
                        hover:text-white
                    "
                >
                    <FiMessageCircle />
                    {memory.comments}
                </button>

            </div>

            <CommentsSection />

        </div>
    );
}

export default MemoryDetails;