import Logo from "./Logo";

function EmptyState({
    title,
    description,
    action
}) {
    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                py-16
                text-center
            "
        >
            {/* Echo logo */}
            <div className="flex items-center justify-center"
            >
                <Logo/>
            </div>

            {/* Title */}
            <h3
                className="
                    mt-6
                    text-xl
                    font-semibold
                    text-white
                "
            >
                {title}
            </h3>

            {/* Description */}
            <p
                className="
                    mt-2
                    max-w-md
                    text-zinc-400
                "
            >
                {description}
            </p>

            {/* Optional action */}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}

        </div>
    );
}

export default EmptyState;