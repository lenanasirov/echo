import { useSelector } from "react-redux";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import MemoryGrid from "../components/moment/MemoryGrid";
import { useAuth } from "../hooks/useAuth";
import { isMemoryOwner } from "../utils/memoryUtils";


function Profile() {
  const navigate = useNavigate();

  const { memories } = useSelector((state) => state.memories);
  const { user } = useAuth();

  // The profile should only display the current user's memories
  const userMemories = memories.filter(
    (memory) => isMemoryOwner(memory, user)
  );

  // Calculate the total number of likes received
  const totalLikes = userMemories.reduce(
      (total, memory) => total + (memory.likes || 0),
      0
  );

  if (!user) {
    return null;
}

  return (
    <section
        className="
            px-5 sm:px-8
            py-12
            md:py-16
        "
    >
        <div
            className="
                mx-auto
                max-w-5xl
            "
        >

          {/* Profile Header */}
          <div
              className="
                  rounded-3xl
                  border
                  border-white/10
                  bg-[#15151D]
                  p-8
              "
          >

              {/* User information */}
              <div
                  className="
                    flex
                    flex-col
                    items-center
                    text-center
                  "
                >

                  {/* Avatar */}
                  <div
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-full
                      bg-linear-to-br
                      from-purple-500
                      to-pink-500
                      text-5xl
                    "
                  >
                    {user.avatar}
                  </div>

                  {/* Name */}
                  <h1
                    className="
                      mt-5
                      text-3xl
                      font-bold
                    "
                  >
                    {user.name}
                  </h1>

                  {/* Username */}
                  <p
                    className="
                        mt-1
                        text-zinc-400
                      "
                  >
                    @{user.username}
                  </p>

                  {/* Email */}
                  <p
                    className="
                      mt-3
                      text-sm
                      text-zinc-500
                    "
                  >
                    {user.email}
                  </p>

                  {/* Bio */}
                  {user.bio && (
                    <p
                      className="
                        mt-4
                        max-w-md
                        text-zinc-400
                        "
                    >
                        {user.bio}
                    </p>
                  )}
                  
                  {/* Edit Profile */}
                  <button
                    onClick={() => navigate("/profile/edit")}
                    className="
                        mt-6
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-5
                        py-2
                        text-sm
                        text-zinc-300
                        transition
                        hover:border-purple-500
                        hover:text-white
                    "
                  >
                    <FiEdit2 />
                    Edit Profile
                  </button>

              </div>

              {/* Stats */}
              <div
                  className="
                    mt-8
                    grid
                    grid-cols-2
                    border-t
                    border-white/10
                    pt-6
                    text-center
                  "
              >

                  {/* Memories */}
                  <div>
                      <p className="font-bold text-xl">
                          {userMemories.length}
                      </p>

                      <span className="text-zinc-400 text-sm">
                          Memories
                      </span>
                  </div>
                  
                  {/* Likes */}
                  <div>
                      <p className="font-bold text-xl">
                          {totalLikes}
                      </p>

                      <span className="text-zinc-400 text-sm">
                          Likes
                      </span>
                  </div>

              </div>

          </div>

          {/* Memories */}
          <div
            className="
              mt-12
            "
          >

            <h2
              className="
                mb-6
                text-2xl
                font-bold
              "
            >
              Echoes
            </h2>


            <MemoryGrid
                memories={userMemories}
            />

          </div>

        </div>

    </section>
  );
}

export default Profile;