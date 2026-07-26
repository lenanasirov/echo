import MemoryCard from "../components/memory/MemoryCard";
import memories from "../data/mockMemories";

function Feed() {
    return (
        <section
            className="
                px-8
                py-12
            "
        >

            <div
                className="
                    mx-auto
                    max-w-3xl
                "
            >

                <div
                    className="
                        flex
                        items-end
                        justify-between
                        gap-6
                        border-b
                        border-white/10
                        pb-8
                    "
                >

                    <div>

                        <h1
                            className="
                                text-4xl
                                font-bold
                            "
                        >
                            Your Feed
                        </h1>

                        <p
                            className="
                                mt-2
                                text-zinc-400
                            "
                        >
                            Discover memories shared through music, emotions, and moments.
                        </p>

                    </div>


                    <div
                        className="
                            hidden
                            rounded-2xl
                            border
                            border-white/10
                            bg-[#15151D]
                            px-5
                            py-3
                            text-sm
                            text-zinc-300
                            md:block
                        "
                    >
                        🎵 3 Memories Today
                    </div>

                </div>

                <div
                    className="
                        mt-12
                        space-y-8
                    "
                >
                    
                    {memories.map((memory) => (
                        <MemoryCard key={memory.id} memory={memory} />
                    ))}

                </div>


            </div>

        </section>
    )
}

export default Feed;