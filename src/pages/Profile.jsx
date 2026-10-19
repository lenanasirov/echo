import { useSelector, useDispatch } from "react-redux";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useState } from "react";

import MemoryGrid from "../components/memory/MemoryGrid";
import { useAuth } from "../hooks/useAuth";
import { isMemoryOwner } from "../utils/memoryUtils";
import { fetchMemories } from "../store/slices/memoriesSlice";
import SpotifyPlayerContext from "../components/spotify/SpotifyPlayerContext";

function SpotifyIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0"
          fill="currentColor"
          aria-hidden="true"
      >
          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0Zm5.503 17.303a.75.75 0 0 1-1.032.247c-2.827-1.728-6.386-2.118-10.578-1.161a.75.75 0 1 1-.334-1.462c4.586-1.047 8.52-.595 11.697 1.345a.75.75 0 0 1 .247 1.031Zm1.473-3.278a.938.938 0 0 1-1.29.309c-3.236-1.99-8.17-2.566-11.997-1.404a.938.938 0 1 1-.545-1.794c4.374-1.327 9.81-.684 13.523 1.6.442.272.58.85.309 1.29Zm.126-3.414c-3.88-2.304-10.286-2.516-13.998-1.39a1.125 1.125 0 1 1-.653-2.153c4.26-1.293 11.343-1.043 15.816 1.613a1.125 1.125 0 0 1-1.165 1.93Z" />
      </svg>
  );
}

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { memories, status} = useSelector(
    (state) => state.memories
  );

  const { user } = useAuth();

  const {
    isConnected,
    connectSpotify,
    disconnect,
  } = useContext(SpotifyPlayerContext);

  const [spotifyActionError, setSpotifyActionError] = useState("");
  const [isSpotifyActionPending, setIsSpotifyActionPending] = useState(false);

  const handleSpotifyConnect = async () => {
      setSpotifyActionError("");
      setIsSpotifyActionPending(true);

      try {
          await connectSpotify();
      } catch (err) {
          setSpotifyActionError(err.message || "Couldn't connect Spotify.");
          setIsSpotifyActionPending(false);
      }
  };

  const handleSpotifyDisconnect = async () => {
      setSpotifyActionError("");
      setIsSpotifyActionPending(true);

      try {
          await disconnect();
      } catch (err) {
          setSpotifyActionError(err.message || "Couldn't disconnect Spotify.");
      } finally {
          setIsSpotifyActionPending(false);
      }
  };

  useEffect(() => {
      if (status === "idle") {
          dispatch(fetchMemories());
      }
  }, [status, dispatch]);

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

                  {/* Avatar + Streak */}
                  <div className="relative">
                      {/* Avatar */}
                      <div
                          className="
                              flex
                              h-36
                              w-36
                              items-center
                              justify-center
                              rounded-full
                              bg-linear-to-br
                              from-purple-500
                              to-pink-500
                              text-6xl
                          "
                      >
                          {user.avatar}
                      </div>

                      {/* Streak */}
                      <div
                          className="
                              absolute
                              bottom-0
                              left-1/2
                              -translate-x-1/2
                              translate-y-1/2
                              whitespace-nowrap
                              rounded-full
                              border
                              border-orange-400/20
                              bg-[#15151D]
                              px-4
                              py-1.5
                              text-sm
                              shadow-lg
                          "
                      >
                          <span className="text-base">🔥</span>
                          <span className="ml-1 font-bold text-white">
                              {user.streak || 0}
                          </span>
                      </div>
                  </div>

                  {/* Name */}
                  <h1
                    className="
                      mt-12
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

              {/* Spotify */}
              <div className="mt-4 flex justify-center">
                  {isConnected ? (
                      <button
                          type="button"
                          onClick={handleSpotifyDisconnect}
                          disabled={isSpotifyActionPending}
                          className="
                              flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-[#1DB954]/30
                              bg-white/5
                              px-5
                              py-2
                              text-sm
                              text-[#1DB954]
                              transition
                              hover:border-[#1DB954]
                              hover:bg-[#1DB954]/10
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                          "
                      >
                          <SpotifyIcon />
                          {isSpotifyActionPending
                              ? "Disconnecting..."
                              : "Disconnect from Spotify"}
                      </button>
                  ) : (
                      <button
                          type="button"
                          onClick={handleSpotifyConnect}
                          disabled={isSpotifyActionPending}
                          className="
                              flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-[#1DB954]/30
                              bg-[#1DB954]/10
                              px-5
                              py-2
                              text-sm
                              text-[#1DB954]
                              transition
                              hover:border-[#1DB954]
                              hover:bg-[#1DB954]/20
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                          "
                      >
                          <SpotifyIcon />
                          {isSpotifyActionPending
                              ? "Connecting..."
                              : "Connect to Spotify"}
                      </button>
                  )}
              </div>

              {spotifyActionError && (
                  <p className="mt-2 text-sm text-red-400" role="alert">
                      {spotifyActionError}
                  </p>
              )}
              

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