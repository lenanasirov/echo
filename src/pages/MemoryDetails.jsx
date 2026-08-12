import { useParams } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { isMemoryOwner } from "../utils/memoryUtils";
import { useAuth } from "../hooks/useAuth";
import useImage from "../hooks/useImage";
import Button from "../components/common/Button";
import CommentsSection from "../components/memory/CommentsSection";

import {
    FiHeart,
    FiMessageCircle,
    FiMapPin,
    FiArrowLeft,
    FiEdit2
} from "react-icons/fi";


function MemoryDetails() {
    const { user } = useAuth();
    const { memories } = useSelector((state) => state.memories);
    
    const navigate = useNavigate();

    const { id } = useParams();
    const [liked, setLiked] = useState(false);

    const handleLike = () => {
        setLiked(!liked)
    };

    // find the memory with the given id
    const memory = memories.find(
        (memory) => memory.id === Number(id)
    );

    const { imageUrl, isLoading } = useImage(memory?.image);

    if(!memory){
        return(
            <div
                className="
                    mx-auto
                    max-w-3xl
                    px-6
                    py-16
                    text-center
                "
            >
                <h1 className="text-3xl font-bold text-white">
                    Memory not found
                </h1>

                <p className="mt-4 text-zinc-400">
                    The memory you're looking for doesn't exist or may have been removed.
                </p>

                <Link to="/feed">
                    <Button className="mt-8">
                        Back to Feed
                    </Button>
                </Link>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div
                className="
                    mx-auto
                    max-w-4xl
                    px-6
                    py-16
                    text-center
                    text-zinc-400
                "
            >
                Loading memory...
            </div>
        );
    }

    // check if the memory is owned by the user
    const isOwner = isMemoryOwner(memory, user);   


    return(
        <motion.div
            initial={{
                opacity:0,
                y:20
            }}
            animate={{
                opacity:1,
                y:0
            }}
            className="
                mx-auto
                max-w-4xl
                px-6
                py-10
                lg:px-8
            "
        >
            {/* Back button */}
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
                {imageUrl? (
                    <img
                        src={imageUrl}
                        alt={memory.caption}
                        className="
                            aspect-video
                            w-full
                            object-cover
                            transition
                            duration-500
                            hover:scale-[1.02]
                        "
                    />
                ) : (
                    <div
                        className="
                            flex
                            aspect-video
                            w-full
                            items-center
                            justify-center
                            bg-white/5
                            text-zinc-500
                        "
                    >
                        <div className="text-center">
                            <div className="text-4xl">📷</div>
                            <p className="mt-3">
                                Image unavailable
                            </p>
                        </div>
                    </div>
                )}

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

                {/* Edit button */}
                {isOwner && (
                    <button
                        onClick={() => navigate(`/memory/${memory.id}/edit`)}
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
                            text-zinc-400
                            transition
                            hover:border-purple-500
                            hover:text-white
                        "
                    >
                        <FiEdit2 />
                        Edit
                    </button>
                )}

            </div>

            {/* Caption */}
            <p
                className="
                    mt-10
                    text-xl
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
                    rounded-2xl
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
                    🎵 {memory.song?.title}
                </h3>


                <p
                    className="
                        mt-1
                        text-zinc-400
                    "
                >
                    {memory.song?.artist}
                </p>

            </div>

            {/* Extra information */}
            <div
                className="
                    mt-8
                    flex
                    flex-col
                    gap-3
                    text-sm
                    text-zinc-400
                "
            >
                <span>
                    {memory.mood}
                </span>

                <span className="flex items-center gap-2">
                    <FiMapPin />
                    {memory.location}
                </span>
            </div>           
            {/* <div
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

            </div> */}

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
                </button>

            </div>

            <hr
                className="
                    my-8
                    border-white/10
                "
            />

            <CommentsSection />

        </motion.div>
    );
}

export default MemoryDetails;