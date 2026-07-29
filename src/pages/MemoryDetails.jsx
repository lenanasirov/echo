import { useParams } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CommentsSection from "../components/memory/CommentsSection";

import {
    FiHeart,
    FiMessageCircle,
    FiMapPin,
    FiArrowLeft
} from "react-icons/fi";


function MemoryDetails({ memories }) {
    const navigate = useNavigate();
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
                px-6
                py-10
                lg:px-8
            "
        >
            <button
                onClick={() => navigate(-1)}
                className="
                    mb-8
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-2
                    text-sm
                    text-zinc-400
                    transition
                    hover:border-purple-500
                    hover:text-white
                "
            >
                <FiArrowLeft className="text-lg" />
                Back
            </button>

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
                        h-115
                        w-full
                        object-cover
                        transition
                        duration-500
                        hover:scale-[1.02]
                    "
                />

            </div>

            {/* User */}
            <div
                className="
                    mt-8
                    flex
                    items-center
                    justify-between
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-4
                    "
                >

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-linear-to-r
                            from-purple-500
                            to-pink-500
                            text-2xl
                        "
                    >
                        {memory.user.avatar}
                    </div>

                    <div>

                        <h2
                            className="
                                text-xl
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

            </div>

            {/* Caption */}
            <p
                className="
                    mt-10
                    text-2xl
                    font-medium
                    leading-relaxed
                    tracking-tight
                "
            >
                {memory.caption}
            </p>            

            {/* Song */}
            <div
                className="
                    mt-10
                    rounded-3xl
                    border
                    border-white/10
                    bg-linear-to-br
                    from-white/5
                    to-white/2
                    p-6
                "
            >

                <p
                    className="
                        text-xs
                        uppercase
                        tracking-[0.25em]
                        text-zinc-500
                    "
                >
                    Soundtrack
                </p>


                <h3
                    className="
                        mt-3
                        text-xl
                        font-semibold
                    "
                >
                    🎵 {memory.song.title}
                </h3>


                <p
                    className="
                        mt-1
                        text-zinc-400
                    "
                >
                    {memory.song.artist}
                </p>

            </div>

            {/* Extra information */}
            <div
                className="
                    mt-8
                    flex
                    flex-wrap
                    gap-3
                "
            >

                <span
                    className="
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-4
                        py-2
                        text-sm
                    "
                >
                    {memory.mood}
                </span>


                <span
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-4
                        py-2
                        text-sm
                    "
                >
                    <FiMapPin />
                    {memory.location}
                </span>

            </div>

            <hr
                className="
                    mt-8
                    border-white/10
                "
            />

            {/* Actions */}
            <div
                className="
                    mt-8
                    flex
                    items-center
                    gap-6
                    text-sm
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
                            text-lg
                            transition
                            duration-200
                            ${liked ? "fill-pink-500 text-pink-500" : ""}
                        `}
                    />

                    <span>
                        {memory.likes + (liked ? 1 : 0)}
                    </span>

                    <span>
                        Likes
                    </span>

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
                    <FiMessageCircle className="text-lg"/>

                    <span>
                        {memory.comments}
                    </span>

                    <span>
                        Comments
                    </span>

                </button>

            </div>

            <hr
                className="
                    my-8
                    border-white/10
                "
            />

            <CommentsSection />

        </div>
    );
}

export default MemoryDetails;