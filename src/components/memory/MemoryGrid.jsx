import { FiMusic } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useImage from "../../hooks/useImage";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";

function MemoryGridItem({ memory }) {
    const { imageUrl, isLoading } = useImage(memory.image);

    return (
        <Link
            to={`/memory/${memory.id}`}
            className="block"
        >
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.95
                }}
                animate={{
                    opacity: 1,
                    scale: 1
                }}
                transition={{
                    duration: 0.3
                }}
                className="
                    group
                    relative
                    aspect-square
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                "
            >

                {isLoading ? (
                    <div
                        className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            bg-white/5
                            text-zinc-500
                        "
                    >
                         Loading...
                    </div>
                ) :imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={memory.caption}
                        className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                        "
                    />
                ) : (
                                        <div
                        className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            bg-white/5
                            text-zinc-500
                        "
                    >
                        <div className="text-center">
                                <div className="text-3xl">
                                    📷
                                </div>

                                <p className="mt-2 text-sm">
                                    Image unavailable
                                </p>
                            </div>
                        </div>
                )}


                <div
                    className="
                        absolute
                        inset-0
                        flex
                        items-end
                        bg-linear-to-t
                        from-black/60
                        to-transparent
                        p-4
                        opacity-0
                        transition
                        group-hover:opacity-100
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-white
                        "
                    >
                        <FiMusic />

                        <span>
                            {memory.song?.title}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

function MemoryGrid({ memories }) {
    if (memories.length === 0) {
        return (
            <EmptyState
                title="No memories yet."
                description="Create your first Echo 🎵"
                action={
                    <Link to="/create">
                        <Button className="mt-6">
                            Create Memory
                        </Button>
                    </Link>
                }
            />
        );
    }
    return (
        <div
            className="
                grid
                grid-cols-2
                gap-4
                md:grid-cols-3
            "
        >

            {memories.map((memory) => (
                <MemoryGridItem
                    key={memory.id}
                    memory={memory}
                />
            ))}

        </div>
    );
}

export default MemoryGrid;