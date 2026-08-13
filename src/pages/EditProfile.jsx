import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

function EditProfile() {
    const navigate = useNavigate();

    const { user, updateProfile } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatar, setAvatar] = useState(user?.avatar || "🌸");

    if (!user) {
        return null;
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        updateProfile({
            name,
            username,
            avatar,
            bio
        });

        navigate("/profile");
    };

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
                    max-w-2xl
                "
            >
                <h1 className="text-4xl font-bold">
                    Edit Profile
                </h1>

                <p className="mt-2 text-zinc-400">
                    Update your profile information.
                </p>

                <form 
                    onSubmit={handleSubmit}
                    className="
                        mt-10
                        rounded-3xl
                        border
                        border-white/10
                        bg-[#15151D]
                        p-8
                    "
                >
                    {/* Avatar */}
                    <div>
                        <label
                            className="
                                text-sm
                                font-medium
                                text-zinc-400
                            "
                        >
                            Avatar
                        </label>

                        <div className="mt-3 flex flex-wrap gap-3">
                            {["🌸", "🌙", "⭐", "🌊", "🔥", "🎵"].map(
                                (option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setAvatar(option)}
                                        className={`
                                            flex
                                            h-14
                                            w-14
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            text-2xl
                                            transition
                                            ${
                                                avatar === option
                                                    ? "border-purple-500 bg-purple-500/10"
                                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                            }
                                        `}
                                    >
                                        {option}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="
                                text-sm
                                font-medium
                                text-zinc-400
                            "
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="
                                                                mt-2
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition
                                focus:border-purple-500
                            "
                        />
                    </div>

                    {/* Username */}
                    <div className="mt-6">
                        <label
                            htmlFor="username"
                            className="
                                text-sm
                                font-medium
                                text-zinc-400
                            "
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="
                                mt-2
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition
                                focus:border-purple-500
                            "
                        />
                    </div>

                    {/* Email */}
                    <div className="mt-6">
                        <label
                            htmlFor="email"
                            className="
                                text-sm
                                font-medium
                                text-zinc-300
                            "
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="
                                mt-2
                                w-full
                                cursor-not-allowed
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-3
                                text-zinc-500
                            "
                        />

                        <p
                            className="
                                mt-2
                                text-xs
                                text-zinc-500
                            "
                        >
                            Email cannot be changed.
                        </p>
                    </div>


                    {/* Bio */}
                    <div className="mt-6">
                        <label
                            htmlFor="bio"
                            className="
                                text-sm
                                font-medium
                                text-zinc-400
                            "
                        >
                            Bio
                        </label>

                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            placeholder="Tell people a little about yourself..."
                            className="
                                mt-2
                                w-full
                                resize-none
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition
                                focus:border-purple-500 
                            "   
                        />
                    </div>

                    {/* Actions */}
                    <div
                        className="
                            mt-8
                            flex
                            flex-col
                            gap-3
                            sm:flex-row
                            sm:justify-end
                        "
                    >

                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="
                                w-full
                                rounded-full
                                border
                                border-white/10
                                bg-white/5
                                px-6
                                py-3
                                font-medium
                                text-white
                                shadow-lg
                                transition
                                duration-300
                                hover:border-white/20
                                hover:bg-white/10
                                sm:w-auto
                            "
                        >
                            Cancel
                        </button>

                        <Button 
                            type="submit"
                            className="w-full sm:w-auto"
                        >
                            Save Changes
                        </Button>

                    </div>
                
                </form>

            </div>

        </section>
    );
}

export default EditProfile;