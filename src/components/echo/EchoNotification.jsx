import { FiMusic, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function EchoNotification({ type, onClose }) {

    const navigate = useNavigate();

    const isReminder = type === "reminder";

    const handleCreateEcho = () => {
        onClose();
        navigate("/create");
    };

    return (
        <div
            className="
                fixed
                right-6
                top-6
                z-50
                w-[calc(100%-3rem)]
                max-w-sm
                rounded-2xl
                border
                border-white/10
                bg-[#15151D]
                p-5
                shadow-2xl
            "
        >
            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                aria-label="Close notification"
                className="
                    absolute
                    right-4
                    top-4
                    text-zinc-500
                    transition
                    hover:text-white
                "
            >
                <FiX />
            </button>

            {/* Icon */}
            <div
                className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-linear-to-r
                    from-purple-500
                    to-pink-500
                    text-lg
                "
            >
                <FiMusic />
            </div>

            {/* Title */}
            <h2
                className="
                    mt-4
                    text-lg
                    font-semibold
                    text-white
                "
            >
                {isReminder
                    ? "🔥 Don't lose your streak"
                    : "🎵 Your new Echo is here"
                }
            </h2>
            
            {/* Message */}
            <p
                className="
                    mt-2
                    text-sm
                    leading-relaxed
                    text-zinc-400
                "
            >
                {isReminder
                    ? "Your next Echo is waiting. Capture today's moment and keep it going."
                    : "Capture today's moment and give it a soundtrack."
                }
            </p>

            {/* Action */}
            <button
                type="button"
                onClick={handleCreateEcho}
                className="
                    mt-5
                    w-full
                    rounded-full
                    bg-linear-to-r
                    from-purple-500
                    to-pink-500
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:scale-[1.02]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-purple-500
                "
            >
                Create Echo
            </button>
        </div>
    );
}

export default EchoNotification;