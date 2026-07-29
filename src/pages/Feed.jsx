import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

import MemoryCard from "../components/memory/MemoryCard";

function Feed({ memories }) {
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
                        items-end
                        justify-between
                        gap-6
                        border-b
                        border-white/10
                        pb-8
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

                    </div>

                    <Link
                        to="/create"
                        className="
                            hidden
                            md:flex
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
                        "
                    >
                        <FiPlus />

                        New Memory
                    </Link>

                </div>

                {/* Memories */}
                {memories.length === 0 ? (
                    <div
                        className="
                            mt-20
                            text-center
                            text-zinc-400
                        "
                    >

                        <h2
                            className="
                                text-2xl
                                font-semibold
                                text-white
                            "
                        >
                            No memories yet.
                        </h2>

                        <p className="mt-3">
                            Create your first Echo 🎵
                        </p>

                    </div>

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