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
            <h3
                className="
                    text-xl
                    font-semibold
                    text-white
                "
            >
                {title}
            </h3>

            <p
                className="
                    mt-2
                    text-zinc-400
                "
            >
                {description}
            </p>

            {action}
        </div>
    );
}

export default EmptyState;