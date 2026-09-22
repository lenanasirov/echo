import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    FiHeart,
    FiMessageCircle,
    FiMapPin,
    FiMusic,
    FiLock
} from "react-icons/fi";
import formatRelativeTime from "../../utils/formatRelativeTime";

import { useAuth } from "../../hooks/useAuth";

import { 
    likeMemory, 
    unlikeMemory,
    selectLikeLoading
} from "../../store/slices/memoriesSlice";

import useImage from "../../hooks/useImage";

function MemoryCard({ memory, isLocked = false }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useAuth();
    const { imageUrl, isLoading } = useImage(memory?.image);

    const isLikeLoading = useSelector(
        (state) => selectLikeLoading(state, memory?.id)
    );

    const handleCardClick = () => {
        if (isLocked) {
            return;
        }

        navigate(`/memory/${memory.id}`);
    };

    const handleLike = (event) => {
        event.stopPropagation();

        if (!user || isLikeLoading) {
            return;
        }
        
        if(memory.likedByCurrentUser) {
            dispatch(unlikeMemory(memory.id));
        } else {
            dispatch(likeMemory(memory.id));
        }
    };
    return(
        <motion.article
            onClick={handleCardClick}
            whileHover={{
                y: -5
            }}
            initial={{
                opacity: 0,
                y: 30
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                duration: 0.4
            }}
            className="
                cursor-pointer
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-[#15151D]
                transition-all
                duration-300
                hover:border-purple-500/30
                hover:shadow-xl
                hover:shadow-purple-500/10
            "
        >

            {/* Header */}
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    p-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                {/* Author */}
                <div className="flex min-w-0 items-center gap-3">

                    <motion.div
                        whileHover={{
                            rotate: 8,
                            scale: 1.1
                        }}
                        transition={{
                            duration: 0.2
                        }}
                        className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-linear-to-br
                            from-purple-500
                            to-pink-500
                            text-xl
                            text-white
                            shadow-lg
                            shadow-purple-500/10
                        "
                    >
                        {memory.user?.avatar}
                    </motion.div>

                    <div className="min-w-0">

                        <h3
                            className="
                                truncate
                                font-semibold
                                text-white
                            "
                        >
                            {memory.user?.name}
                        </h3>

                        <p
                            className="
                                mt-1
                                flex
                                items-center
                                gap-1
                                truncate
                                text-sm
                                text-zinc-400
                            "
                        >
                            <FiMapPin
                                size={14}
                                className="shrink-0"
                            />

                            {memory.location}
                        </p>

                    </div>
                </div>

                {/* Date */}
                <span
                    className="
                        text-sm
                        text-zinc-500
                        sm:shrink-0
                    "
                >
                    {formatRelativeTime(memory.createdAt)}
                </span>

            </div>

            {/* Photo */}
            <div className="relative overflow-hidden">

                {isLoading ? (
                    <div
                        className="
                            flex
                            h-72
                            items-center
                            justify-center
                            bg-black/20
                        "
                    >
                        <div
                            className="
                                h-6
                                w-6
                                animate-spin
                                rounded-full
                                border-2
                                border-white/20
                                border-t-purple-500
                            "
                        />
                    </div>
                ) : imageUrl ? (
                    <>
                        <motion.img
                            src={imageUrl}
                            alt={isLocked ? "Locked Echo" : memory.caption}
                            whileHover={!isLocked ? {scale: 1.03} : undefined}
                            transition={{
                                duration: 0.25
                            }}
                            className={`
                                h-72
                                w-full
                                object-cover
                                ${isLocked ? "blur-xl scale-105" : ""}
                            `}
                        />

                        {/* Image gradient */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-0
                                bg-linear-to-t
                                from-black/20
                                to-transparent
                            "
                        />
                        
                        {/* Locked overlay */}
                        {isLocked && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    flex
                                    items-center
                                    justify-center
                                    bg-black/40
                                    px-6
                                    text-center
                                "
                            >
                                <div className="max-w-sm">
                                    <div
                                        className="
                                            mx-auto
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-white/20
                                            bg-black/30
                                            text-white
                                        "
                                    >
                                        <FiLock className="text-xl" />
                                    </div>
                                    <p className="mt-4 text-lg font-semibold text-white">
                                        Echo to unlock
                                    </p>

                                    <p className="mt-2 text-sm text-zinc-300">
                                        Create your Echo to see what your friends shared.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            navigate("/create");
                                        }}
                                        className="
                                            mt-5
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            bg-linear-to-r
                                            from-purple-500
                                            to-pink-500
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-medium
                                            text-white
                                            transition
                                            hover:scale-105
                                        "
                                    >
                                        Create Echo
                                    </button>
                                </div>
                            </div>
                        )}


                    </>
                ) : (
                    <div
                        className="
                            flex
                            h-72
                            items-center
                            justify-center
                            bg-black/20
                            text-sm
                            text-zinc-500
                        "
                    >
                        Image unavailable
                    </div>
                )}

            </div>

            {/* Content */}
            
                {isLocked ? null :(
                    <div className="p-5 sm:p-6"> 

                        {/* Song */}
                        <div>
                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-[0.2em]
                                    text-zinc-600
                                "
                            >
                                Soundtrack
                            </p>

                            <h2
                                className="
                                    mt-2
                                    text-2xl
                                    font-semibold
                                    text-white
                                "
                            >
                                {memory.song?.title}
                            </h2>

                            <p
                                className="
                                    mt-1
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-zinc-400
                                "
                            >
                                <FiMusic size={15} />
                                {memory.song?.artist}
                            </p>
                        </div>

                        {/* Mood */}
                        <div className="mt-5">
                            <span
                                className="
                                    inline-flex
                                    rounded-full
                                    border
                                    border-purple-500/20
                                    bg-purple-500/10
                                    px-3
                                    py-1.5
                                    text-sm
                                    text-purple-300
                                "
                            >
                                {memory.mood}
                            </span>
                        </div>

                        {/* Caption */}
                        <p
                            className="
                                mt-5
                                text-sm
                                leading-relaxed
                                text-zinc-400
                            "
                        >
                            "{memory.caption}"
                        </p>

                        {/* Actions */}
                        <div
                            className="
                                mt-6
                                flex
                                items-center
                                gap-5
                                border-t
                                border-white/10
                                pt-5
                            "
                        >
                            {/* Like */}
                            <button
                                type="button"
                                onClick={handleLike}
                                disabled={isLikeLoading}
                                aria-label={
                                    memory.likedByCurrentUser
                                        ? "Unlike memory"
                                        : "Like memory"
                                }
                                className="
                                    group
                                    flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    px-2
                                    py-1.5
                                    text-sm
                                    text-zinc-400
                                    transition
                                    hover:bg-white/5
                                    hover:text-white
                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-purple-500/50
                                "
                            >
                                {isLikeLoading ? (
                                    <span
                                        className="
                                            h-4
                                            w-4
                                            animate-spin
                                            rounded-full
                                            border-2
                                            border-white/20
                                            border-t-purple-400
                                        "
                                    />
                                ) : (
                                    <FiHeart
                                        className={`
                                            text-lg
                                            transition
                                            duration-200
                                            group-hover:scale-110
                                            ${
                                                memory.likedByCurrentUser
                                                    ? "fill-pink-500 text-pink-500"
                                                    : ""
                                            }
                                        `}
                                    />
                                )}

                                <span>
                                    {memory.likes}
                                </span>
                            </button>

                            {/* Comments */}
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    navigate(`/memory/${memory.id}#comment-input`);
                                }}
                                aria-label={`View ${memory.commentCount ?? 0} comments`}
                                className="
                                    group
                                    flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    px-2
                                    py-1.5
                                    text-sm
                                    text-zinc-400
                                    transition
                                    hover:bg-white/5
                                    hover:text-white
                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-purple-500/50
                                "
                            >
                                <FiMessageCircle
                                    className="
                                        text-lg
                                        transition
                                        duration-200
                                        group-hover:scale-110
                                    "
                                />

                                <span>
                                    {memory?.commentCount ?? 0}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

        
        </motion.article>
    );
}

export default MemoryCard;