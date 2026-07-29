import { useState } from "react";

import mockComments from "../../data/mockComments";
import Button from "../common/Button";

function CommentsSection() {
    const [comments, setComments] = useState(mockComments);
    const [newComment, setNewComment] = useState("");

    const handleSubmit = () => {
        if(!newComment.trim()) {
            return;
        }

        const comment = {
            id: Date.now(),
            user: "Lena",
            avatar: "🌸",
            text: newComment
        };

        setComments([
            ...comments,
            comment
        ]);

        setNewComment("");
    };


    return(
        <section
            className="
                mt-10
            "
        >
            <h3
                className="
                    text-xl
                    font-semibold
                "
            >
                Comments
            </h3>

            <div
                className="
                    mt-6
                    space-y-4
                "
            >

                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="
                            flex
                            gap-3
                        "
                    >

                        <div className="text-xl">
                            {comment.avatar}
                        </div>

                        <div>

                            <p
                                className="
                                    font-medium
                                "
                            >
                                {comment.user}
                            </p>


                            <p
                                className="
                                    text-zinc-400
                                "
                            >
                                {comment.text}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

            <div
                className="
                    mt-6
                    flex
                    gap-3
                "
            >

                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="
                        flex-1
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-5
                        py-3
                        text-white
                        outline-none
                    "                    
                />

                <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim()}
                    className="px-5"
                >
                    Post
                </Button>

            </div>

        </section>
    );
}

export default CommentsSection;