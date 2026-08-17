import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

import MemoryCard from "../components/memory/MemoryCard";
import EmptyState from "../components/common/EmptyState";

function Feed() {
    const { memories } = useSelector((state) => state.memories);

    const showEmptyState = false;

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

                {/* Header */}
                <div
                    className="
                        flex
                        flex-col
                        gap-6
                        border-b
                        border-white/10
                        pb-8
                        md:flex-row
                        md:items-end
                        md:justify-between
                    "
                >
                    <div>
                        <h1
                            className="
                                text-4xl
                                font-bold
                            "
                        >
                            Your Feed
                        </h1>

                        <p
                            className="
                                mt-2
                                text-zinc-400
                            "
                        >
                            Discover memories shared through music, emotions, and moments.
                        </p>

                        {/* Mobile New Memory button */}
                        <Link
                            to="/create"
                            className="
                                mt-5
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-linear-to-r
                                from-purple-500
                                to-pink-500
                                px-4
                                py-2.5
                                text-sm
                                font-medium
                                transition
                                hover:scale-105
                                focus:outline-none
                                focus:ring-2
                                focus:ring-purple-500
                                focus:ring-offset-2
                                focus:ring-offset-[#0F0F14]
                                md:hidden
                            "
                        >
                            <FiPlus />
                            New Memory
                        </Link>
                    </div>

                    {/* Desktop New Memory button */}
                    <Link
                        to="/create"
                        className="
                            hidden
                            items-center
                            gap-2
                            rounded-full
                            bg-linear-to-r
                            from-purple-500
                            to-pink-500
                            px-5
                            py-3
                            text-sm
                            font-medium
                            transition
                            hover:scale-105
                            focus:outline-none
                            focus:ring-2
                            focus:ring-purple-500
                            focus:ring-offset-2
                            focus:ring-offset-[#0F0F14]
                            md:inline-flex
                        "
                    >
                        <FiPlus />
                        New Memory
                    </Link>
                </div>

                {/* Memories */}
                {showEmptyState || memories.length === 0 ? (
                    <EmptyState
                        title="No memories yet."
                        description="Create your first Echo 🎵"
                        action={
                            <Link
                                to="/create"
                                className="
                                    mt-6
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    bg-linear-to-r
                                    from-purple-500
                                    to-pink-500
                                    px-5
                                    py-3
                                    text-sm
                                    font-medium
                                    text-white
                                    transition
                                    hover:scale-105
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-purple-500
                                    focus:ring-offset-2
                                    focus:ring-offset-[#0F0F14]
                                "
                            >
                                <FiPlus />
                                Create Memory
                            </Link>
                        }
                    />

                ) : (
                    <div
                        className="
                            mt-12
                            space-y-8
                        "
                    >
                        
                        {memories.map((memory, index) => (
                            <motion.div
                                key={memory.id}
                                initial={{
                                    opacity: 0,
                                    y: 30
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                transition={{
                                    delay: index * 0.15
                                }}>
                                <MemoryCard  memory={memory} />
                            </motion.div>    
                        ))}

                    </div>
                )}



            </div>

        </section>
    )
}

export default Feed;