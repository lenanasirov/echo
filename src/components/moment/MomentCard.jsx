import {
    FiHeart,
    FiMessageCircle
} from "react-icons/fi";

function MomentCard() {
  return (
    <div
      className="
        w-80
        rounded-3xl
        bg-[#15151D]
        p-5
        shadow-2xl
        border
        border-white/10
      "
    >

      {/* Image */}
      <div
        className="
          h-64
          rounded-2xl
          bg-gradient-to-br
          from-purple-500
          to-pink-500
          flex
          items-center
          justify-center
          text-6xl
        "
      >
        📸
      </div>


      {/* Song info */}
      <div className="mt-5">

        <h3 className="text-xl font-semibold">
          Space Song
        </h3>

        <p className="text-zinc-400">
          Beach House
        </p>


        {/* Mood */}
        <div className="
          mt-4
          flex
          justify-between
          text-sm
          text-zinc-300
        ">
          <span>
            🌙 Nostalgic
          </span>

        </div>


        {/* Caption */}
        <p className="
          mt-4
          text-zinc-400
          italic
        ">
          "Late night drive."
        </p>


        {/* Actions */}
        <div className="
          mt-5
          flex
          justify-between
          text-sm
          text-zinc-400
        ">
          <span className="flex items-center gap-1">
            <FiHeart />
            12
          </span>

          <span className="flex items-center gap-1">
            <FiMessageCircle />
            3
          </span>
        </div>

      </div>

    </div>
  );
}

export default MomentCard;