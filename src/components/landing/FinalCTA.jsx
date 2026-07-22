import { motion } from "framer-motion";
import Button from "../common/Button";

function FinalCTA() {
    return(
        <section 
            className="
                relative
                overflow-hidden
                px-8
                py-32
            "
        >

            {/* Background glow */}
            <div
                className="
                    absolute
                    left-1/2
                    top-1/2
                    h-72
                    w-72
                    md:h-[500px]
                    md:w-[500px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-purple-600/20
                    blur-3xl
                "
            />
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 40
                    }}

                    whileInView={{
                        opacity: 1,
                        y: 0
                    }}

                    viewport={{
                        once: true
                    }}

                    transition={{
                        duration: 0.8
                    }}

                    className="
                        relative
                        mx-auto
                        max-w-3xl
                        text-center
                    "
                >
                    <h2
                        className="
                            text-5xl
                            font-extrabold
                            tracking-tight
                            md:text-6xl
                        "
                    >
                        Don't let your moments
                        <br/>

                        <span
                            className="
                                bg-gradient-to-r
                                from-purple-400
                                to-pink-400
                                bg-clip-text
                                text-transparent
                            "
                        >
                            be forgotten.
                        </span>
                        
                    </h2>

                    <p
                        className="
                            mx-auto
                            mt-8
                            max-w-xl
                            text-lg
                            leading-relaxed
                            text-zinc-400
                        "
                    >
                        Keep the songs.
                        <br />
                        Keep the feelings.
                        <br />
                        Keep the memories.
                    </p>

                    <motion.div
                        className="
                            mt-10
                            flex
                            justify-center
                        "

                        whileHover={{
                            scale: 1.05
                        }}
                    >
                        <Button>
                            Join Echo
                        </Button>

                    </motion.div>

                </motion.div>

        </section>

    );
}

export default FinalCTA;