import { motion } from "framer-motion";

const screens = {
    memory: {
        image: "📸",

        song: "Space Song",
        artist: "Beach House",

        date: "June 14, 2026",
        location: "📍 Ashdod Beach",

        mood: "🌙 Nostalgic",

        caption: "\"Late night drive.\"",

        likes: 12,
        comments: 3
    },


    timeline: {
        memories: [
            {
                date: "June 14, 2026",

                image: "📸",

                song: "Space Song",
                artist: "Beach House",

                location: "📍 Ashdod Beach",

                mood: "🌙 Nostalgic"
            },

            {
                date: "May 28, 2026",

                image: "📸",

                song: "Yellow",
                artist: "Coldplay",

                location: "📍 Tel Aviv",

                mood: "☀️ Happy"
            },

            {
                date: "April 09, 2026",

                image: "📸",

                song: "Sparks",
                artist: "Coldplay",

                location: "📍 Home",

                mood: "✨ Peaceful"
            }
        ]
    },


    friends: {
        user: "Alex",

        posted: "2 hours ago",

        image: "📸",

        song: "Yellow",
        artist: "Coldplay",

        location: "📍 London",

        mood: "☀️ Happy",

        caption: "\"This reminds me of summer.\"",

        likes: 24,
        comments: 5
    }
};

function PhoneMockup ({ type, title, delay = 0 }) {

    const content = screens[type];

        return (
            <div className="flex flex-col items-center">

                {/* Screen title */}
                <h3
                    className="
                        mb-6
                        text-lg
                        font-semibold
                    "
                >
                    {title}
                </h3>

                {/* Phone */}
                <motion.div
                    animate={{
                        y: [0, -12, 0]
                    }}

                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        delay
                    }}

                    whileHover={{
                        scale: 1.05,
                        rotateY: 8
                    }}

                    className="
                        relative
                        h-[560px]
                        w-72
                        rounded-[40px]
                        border
                        border-white/20
                        bg-gradient-to-b
                        from-zinc-800
                        to-black
                        p-3
                        shadow-2xl
                        shadow-purple-500/20
                    "
                >
                    
                    {/* Screen */}
                    <div
                        className="
                            h-full
                            rounded-[32px]
                            bg-black/80
                            p-5
                            backdrop-blur-xl
                            overflow-hidden
                        "
                    >

                        {/* Status bar */}
                        <div className="
                            mb-6
                            flex
                            items-center
                            justify-between
                            text-xs
                            text-zinc-500
                        ">
                            <span>
                                9:41
                            </span>

                            <div
                                className="
                                    h-5
                                    w-24
                                    rounded-full
                                    bg-white/10
                                "
                            />

                            <span>
                                🔋
                            </span>
                        </div>

                        {/* MEMORY */}
                        {type === "memory" && (
                            <div>

                                <div
                                    className="
                                        flex
                                        h-40
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-gradient-to-br
                                        from-purple-500
                                        to-pink-500
                                        text-6xl
                                    "
                                >
                                    {content.image}
                                </div>


                                <div className="mt-5">

                                    <h3
                                        className="
                                            text-xl
                                            font-semibold
                                        "
                                    >
                                        {content.song}
                                    </h3>


                                    <p
                                        className="
                                            text-zinc-400
                                        "
                                    >
                                        {content.artist}
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
                                        <span>
                                            {content.mood}
                                        </span>

                                        <span>
                                            {content.location}
                                        </span>
                                    </div>


                                    <p
                                        className="
                                            mt-5
                                            italic
                                            text-zinc-400
                                        "
                                    >
                                        {content.caption}
                                    </p>


                                    <div
                                        className="
                                            mt-6
                                            flex
                                            justify-between
                                            text-sm
                                            text-zinc-400
                                        "
                                    >
                                        <span>
                                            ❤️ {content.likes}
                                        </span>

                                        <span>
                                            💬 {content.comments}
                                        </span>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* TIMELINE */}
                        {type === "timeline" && (
                            <div>

                                <h3
                                    className="
                                        text-xl
                                        font-semibold
                                    "
                                >
                                    Memories
                                </h3>


                                <div
                                    className="
                                        mt-5
                                        space-y-4
                                    "
                                >

                                    {content.memories.map((memory) => (

                                        <div
                                            key={memory.date}
                                            className="
                                                rounded-2xl
                                                border
                                                border-white/10
                                                bg-white/5
                                                p-3
                                            "
                                        >

                                            <p
                                                className="
                                                    text-xs
                                                    text-zinc-500
                                                "
                                            >
                                                {memory.date}
                                            </p>


                                            <p
                                                className="
                                                    mt-2
                                                    font-medium
                                                "
                                            >
                                                {memory.song}
                                            </p>


                                            <p
                                                className="
                                                    text-sm
                                                    text-zinc-400
                                                "
                                            >
                                                {memory.artist}
                                            </p>


                                            <div
                                                className="
                                                    mt-2
                                                    flex
                                                    justify-between
                                                    text-xs
                                                    text-zinc-400
                                                "
                                            >

                                                <span>
                                                    {memory.mood}
                                                </span>

                                                <span>
                                                    {memory.location}
                                                </span>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        )}


                        {/* FRIENDS */}
                        {type === "friends" && (

                            <div>

                                {/* User */}
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <div>

                                        <p
                                            className="
                                                font-semibold
                                            "
                                        >
                                            {content.user}
                                        </p>


                                        <p
                                            className="
                                                text-xs
                                                text-zinc-500
                                            "
                                        >
                                            shared a memory · {content.posted}
                                        </p>

                                    </div>


                                    <span>
                                        👤
                                    </span>

                                </div>



                                {/* Image */}
                                <div
                                    className="
                                        mt-6
                                        flex
                                        h-36
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-gradient-to-br
                                        from-purple-500
                                        to-pink-500
                                        text-5xl
                                    "
                                >
                                    {content.image}
                                </div>



                                {/* Song */}
                                <div className="mt-5">

                                    <h3
                                        className="
                                            text-xl
                                            font-semibold
                                        "
                                    >
                                        {content.song}
                                    </h3>


                                    <p
                                        className="
                                            text-zinc-400
                                        "
                                    >
                                        {content.artist}
                                    </p>



                                    {/* Mood + Location */}
                                    <div
                                        className="
                                            mt-4
                                            flex
                                            justify-between
                                            text-sm
                                            text-zinc-300
                                        "
                                    >

                                        <span>
                                            {content.mood}
                                        </span>


                                        <span>
                                            {content.location}
                                        </span>

                                    </div>



                                    {/* Caption */}
                                    <p
                                        className="
                                            mt-5
                                            italic
                                            text-zinc-400
                                        "
                                    >
                                        {content.caption}
                                    </p>



                                    {/* Actions */}
                                    <div
                                        className="
                                            mt-6
                                            flex
                                            justify-between
                                            text-sm
                                            text-zinc-400
                                        "
                                    >

                                        <span>
                                            ❤️ {content.likes}
                                        </span>


                                        <span>
                                            💬 {content.comments}
                                        </span>

                                    </div>


                                </div>

                            </div>

                        )}

                    </div>
                </motion.div>
            </div>
    );
}

export default PhoneMockup;