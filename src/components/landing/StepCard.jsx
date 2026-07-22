import { motion } from "framer-motion";

function StepCard ({ number, icon, title, description }) {
    return (
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
                duration: 0.6
            }}

            className="
                flex
                flex-col
                items-center
                text-center
            "
        >

        <motion.div
            whileHover={{
            scale: 1.1
            }}

            className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-purple-500
                to-pink-500
                text-4xl
                shadow-xl
                shadow-purple-500/30
            "
        >
                {icon}
            </motion.div>

            <span
                className="
                mt-6
                text-sm
                text-zinc-500
                "
            >
                STEP {number}
            </span>

            <h3
                className="
                mt-2
                text-xl
                font-semibold
                "
            >
                {title}
            </h3>

            <p
                className="
                mt-3
                max-w-xs
                text-zinc-400
                "
            >
                {description}
            </p>


        </motion.div>
    );
}

export default StepCard;