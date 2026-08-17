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
            <div
                className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-linear-to-br
                    from-purple-500/20
                    to-pink-500/20
                "
            >
                <Logo showName={false} />
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