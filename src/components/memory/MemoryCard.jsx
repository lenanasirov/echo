import { motion } from "framer-motion";
import {
    FiHeart,
    FiMessageCircle,
    FiMapPin,
    FiMusic
} from "react-icons/fi";

function MemoryCard({ memory }) {
    return(
        <motion.article
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
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-[#15151D]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-purple-500/30
            "
        >

            {/* Header */}
            <div
                className="
                    flex
                    items-center
                    justify-between
                    p-5
                "
            >
                <div className="flex items-center gap-3">

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
                            items-center
                            justify-center
                            rounded-full
                            bg-linear-to-br
                            from-purple-500
                            to-pink-500
                            text-white
                            text-xl
                        "
                    >
                        {memory.user.avatar}
                    </motion.div>

                    <div>

                        <h3 className="font-semibold">
                            {memory.user.name}
                        </h3>

                        <p className="
                                mt-1
                                flex
                                items-center
                                gap-1
                                text-sm
                                text-zinc-
                            "
                        >
                            <FiMapPin size={14} />
                            {memory.location}
                        </p>

                    </div>

                </div>

                <span className="text-sm text-zinc-500">
                    {memory.date}
                </span>

            </div>  

            {/* Photo */}
            <div className="relative overflow-hidden">
                <motion.img
                    src={memory.image}
                    alt={memory.caption}
                    whileHover={{
                        scale: 1.03
                    }}
                    transition={{
                        duration: 0.25
                    }}
                    className="
                        h-72
                        w-full
                        object-cover
                    "
                />

                {/* Image overlay */}
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
            </div>


            {/* Content */}
            <div className="p-5">

                <h2 className="text-2xl font-semibold">
                    {memory.song.title}
                </h2>

                <p className="
                        mt-1
                        flex
                        items-center
                        gap-2
                        text-zinc-400
                    "
                >
                    <FiMusic size={16} />
                    {memory.song.artist}
                </p>

                <div
                    className="
                        mt-4
                        flex
                        justify-between
                        text-sm
                        text-zinc-300
                    "
                >
                    <motion.span
                        whileHover={{
                            scale: 1.05
                        }}
                        className="
                            rounded-full
                            bg-purple-500/10
                            px-3
                            py-1
                            text-sm
                            text-purple-300
                        "
                    >
                        {memory.mood}
                    </motion.span>
                </div>

                <p
                    className="
                        mt-4
                        italic
                        leading-relaxed
                        text-zinc-400
                    "
                >
                    "{memory.caption}"
                </p>

                <div
                    className="
                        mt-6
                        flex
                        items-center
                        justify-between
                        border-t
                        border-white/10
                        pt-5
                        text-sm
                        text-zinc-400                        
                    "
                >
                    <span className="flex items-center gap-2">
                        <FiHeart /> 
                        {memory.likes}
                    </span>

                    <span className="flex items-center gap-2">
                        <FiMessageCircle /> 
                        {memory.comments}
                    </span>
                </div>

            </div>

        </motion.article>
    );
}

export default MemoryCard;