import user from "../data/mockUser";
import memories from "../data/mockMemories";
import MemoryGrid from "../components/moment/MemoryGrid";

function Profile() {
  return (
            <section
            className="
                px-8
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
                        {user.username}
                      </p>

                      {/* Bio */}
                      <p
                        className="
                          mt-4
                          max-w-md
                          text-zinc-400
                          "
                      >
                          {user.bio}
                      </p>

                  </div>

                  {/* Stats */}
                  <div
                      className="
                        mt-8
                        grid
                        grid-cols-3
                        border-t
                        border-white/10
                        pt-6
                        text-center
                      "
                  >

                      <div>
                          <p className="font-bold text-xl">
                              {user.stats.memories}
                          </p>

                          <span className="text-zinc-400 text-sm">
                              Memories
                          </span>
                      </div>
                      
                      <div>
                          <p className="font-bold text-xl">
                              {user.stats.likes}
                          </p>

                          <span className="text-zinc-400 text-sm">
                              Likes
                          </span>
                      </div>

                      <div>
                          <p className="font-bold text-xl">
                              {user.stats.friends}
                          </p>

                          <span className="text-zinc-400 text-sm">
                              Friends
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
                    memories={memories}
                />

              </div>

            </div>

        </section>
  );
}

export default Profile;