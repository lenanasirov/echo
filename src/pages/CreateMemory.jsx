import { useState } from "react";
import Button from "../components/common/Button";

function CreateMemory() {
    const [selectedMood, setSelctedMood] = useState("");

    const moods = [
                "😊 Happy",
                "🌙 Nostalgic",
                "🔥 Energetic",
                "💙 Calm"
    ];

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
                    max-w-3xl
                "
            >

                <h1
                    className="
                        text-4xl
                        font-bold
                    "
                >
                    Create a Memory
                </h1>

                <p
                    className="
                        mt-2
                        text-zinc-400
                    "
                >
                    Capture a moment and give it a soundtrack.
                </p>     

                <div
                    className="
                        mt-10
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
                        h-72
                        cursor-pointer
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-dashed
                        border-white/20
                        bg-black/20
                        text-zinc-400
                        transition
                        hover:border-purple-500
                    "
                >
                    <span className="text-5xl">
                        📸
                    </span>

                    <span className="mt-3">
                        Add a photo
                    </span>

                </div> 

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Song
                        </label>


                        <div
                            className="
                                mt-3
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-4
                            "
                        >

                            <h3 className="font-semibold">
                                Space Song
                            </h3>

                            <p className="text-zinc-400">
                                Beach House
                            </p>

                        </div>

                    </div>

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Mood
                        </label>


                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                gap-3
                            "
                        >

                            {moods.map((mood) => (

                                <button
                                    onClick={() => setSelctedMood(mood)}
                                    key={mood}
                                    className={`
                                        rounded-full
                                        px-4
                                        py-2
                                        text-sm
                                        transition

                                        ${
                                            selectedMood === mood
                                            ? "bg-purple-500 text-white"
                                            : "border border-white/10 text-zinc-300 hover:border-purple-500"
                                        }
                                    `}
                                >
                                    {mood}
                                </button>

                            ))}

                        </div>

                    </div>

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Your thought
                        </label>


                        <textarea
                            placeholder="What makes this moment special?"
                            className="
                                mt-3
                                h-32
                                w-full
                                resize-none
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-4
                                text-white
                                placeholder:text-zinc-500
                                outline-none
                                transition
                                focus:border-purple-500
                            "
                        />

                    </div>

                    <div className="mt-8">

                        <label
                            className="
                                text-sm
                                text-zinc-400
                            "
                        >
                            Location
                        </label>


                        <div
                            className="
                                mt-3
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-4
                                text-zinc-300
                            "
                        >

                            <span>
                                📍
                            </span>

                            <span>
                                Ashdod, Israel
                            </span>

                        </div>

                    </div>

                    <div
                        className="
                            mt-10
                            flex
                            justify-end
                        "
                    >

                        <Button>
                            Save Memory
                        </Button>

                    </div>     

                </div>                      
                                
            </div>            

        </section>
    );
}

export default CreateMemory;