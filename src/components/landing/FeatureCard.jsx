function FeatureCard ({ icon, title, description }) {
    return (
        <div
            className="
                rounded-3xl
                border
                border-white/10
                bg-[#15151D]
                p-8
                transition
                duration-300
                hover:-translate-y-2
            "
        >

            <div className="text-4xl">
                {icon}
            </div>

            <h3 className="
                mt-6
                text-xl
                font-semibold
            ">
                {title}
            </h3>

            <p className="
                mt-3
                text-zinc-400
                leading-relaxed
            ">
                {description}
            </p>


        </div>
    );
}

export default FeatureCard;