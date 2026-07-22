import { motion } from "framer-motion";

function FeatureCard ({ icon, title, description }) {
    const Icon = icon;

    return (
        <div
            className="
                rounded-3xl
                border
                border-white/10
                bg-[#15151D]
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-purple-500/30
            "
        >

            <motion.div 
                whileHover={{
                    scale: 1.1
                }}

                className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-purple-500
                    to-pink-500
                    text-3xl
                    shadow-lg
                    shadow-purple-500/20
                "
            >
                <Icon />
            </motion.div>

            <h3 
                className="
                    mt-5
                    text-xl
                    font-semibold
                "
            >
                {title}
            </h3>

            <p 
                className="
                    mt-2
                    text-zinc-400
                    leading-relaxed
                "
            >
                {description}
            </p>


        </div>
    );
}

export default FeatureCard;