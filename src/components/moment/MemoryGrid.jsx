import { FiMusic } from "react-icons/fi";
import { motion } from "framer-motion";

function MemoryGrid({ memories }) {
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
                <motion.div
                    key={memory.id}
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
                    <img
                        src={memory.image}
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

                    {/* Overlay */}
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
                                {memory.song.title}
                            </span>

                        </div>

                    </div>

                </motion.div>                
            ))}

        </div>
    );
}

export default MemoryGrid;