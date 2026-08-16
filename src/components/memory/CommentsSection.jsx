import { useState } from "react";
import { useDispatch } from "react-redux";

import {
    FiEdit2,
    FiTrash2
} from "react-icons/fi";

import { addComment, updateComment, deleteComment } from "../../store/slices/memoriesSlice";
import { useAuth } from "../../hooks/useAuth";

import Button from "../common/Button";

function CommentsSection({ memory }) {
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const dispatch = useDispatch();
    const { user } = useAuth();

    const comments = memory?.comments || [];

    const formatRelativeTime = (createdAt) => {
        const now = new Date();
        const commentDate = new Date(createdAt);

        const differenceInSeconds = Math.floor(
            (now - commentDate) / 1000
        );

        if (differenceInSeconds < 60) {
            return "just now";
        }

        const differenceInMinutes = Math.floor(
            differenceInSeconds / 60
        );

        if (differenceInMinutes < 60) {
            return `${differenceInMinutes}m ago`;
        }

        const differenceInHours = Math.floor(
            differenceInMinutes / 60
        );

        if (differenceInHours < 24) {
            return `${differenceInHours}h ago`;
        }

        const differenceInDays = Math.floor(
            differenceInHours / 24
        );

        if (differenceInDays < 7) {
            return `${differenceInDays}d ago`;
        }

        const differenceInWeeks = Math.floor(
            differenceInDays / 7
        );

        if (differenceInWeeks < 4) {
            return `${differenceInWeeks}w ago`;
        }

        return commentDate.toLocaleDateString();
    };

    const handleSubmit = () => {
        if(!newComment.trim() || !user || !memory){
            return;
        }

        dispatch(
            addComment({
                memoryId: memory.id,
                comment: {
                    id: Date.now(),
                    userId: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    text: newComment.trim(),
                    createdAt: new Date().toISOString()
                }
            })
        );

        setNewComment("");
    };

    const handleEditStart =(comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text);
    };
    
    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditingText("");
    };

    const handleEditSave = (commentId) => {
        if(!editingText.trim()){
            return;
        }

        dispatch(
            updateComment({
                memoryId: memory.id,
                commentId,
                text: editingText.trim()
            })
        );

        setEditingCommentId(null);
        setEditingText("");
    };

    const handleDelete = (commentId) => {
        dispatch(
            deleteComment({
                memoryId: memory.id,
                commentId
            })
        );
    };

    
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    };


    return (
        <section className="mt-10">

            {/* Header */}
            <div className="flex items-center justify-between">

                <h3 className="text-xl font-semibold">
                    Comments
                </h3>

                <span className="text-sm text-zinc-500">
                    {comments.length}
                </span>

            </div>

            {/* Comments */}
            <div className="mt-6 space-y-5">

                {comments.length === 0 ? (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            px-6
                            py-8
                            text-center
                        "
                    >
                        <div className="text-3xl">
                            💬
                        </div>

                        <p className="mt-3 text-zinc-300">
                            No comments yet
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                            Be the first to share your thoughts.
                        </p>
                    </div>

                ) : (

                    comments.map((comment) => {

                        const isCommentOwner =
                            comment.userId === user?.id;

                        const isEditing =
                            editingCommentId === comment.id;

                        return (
                            <div
                                key={comment.id}
                                className="
                                    group
                                    flex
                                    gap-3
                                "
                            >

                                {/* Avatar */}
                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-linear-to-br
                                        from-purple-500
                                        to-pink-500
                                        text-lg
                                        shadow-md
                                    "
                                >
                                    {comment.avatar}
                                </div>

                                {/* Comment content */}
                                <div
                                    className="
                                        min-w-0
                                        flex-1
                                        rounded-2xl
                                        bg-white/5
                                        px-4
                                        py-3
                                    "
                                >

                                    {isEditing ? (

                                        /* Edit mode */
                                        <div>

                                            <input
                                                value={editingText}
                                                onChange={(event) =>
                                                    setEditingText(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {

                                                    if (
                                                        event.key === "Enter" &&
                                                        !event.shiftKey
                                                    ) {
                                                        event.preventDefault();

                                                        handleEditSave(
                                                            comment.id
                                                        );
                                                    }

                                                    if (
                                                        event.key === "Escape"
                                                    ) {
                                                        handleEditCancel();
                                                    }
                                                }}
                                                autoFocus
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-white/10
                                                    bg-black/20
                                                    px-3
                                                    py-2
                                                    text-sm
                                                    text-white
                                                    outline-none
                                                    transition
                                                    focus:border-purple-500/50
                                                "
                                            />

                                            <div
                                                className="
                                                    mt-3
                                                    flex
                                                    gap-2
                                                "
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditSave(
                                                            comment.id
                                                        )
                                                    }
                                                    disabled={
                                                        !editingText.trim()
                                                    }
                                                    className="
                                                        rounded-full
                                                        bg-purple-500
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-medium
                                                        text-white
                                                        transition
                                                        hover:bg-purple-600
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleEditCancel}
                                                    className="
                                                        rounded-full
                                                        border
                                                        border-white/10
                                                        bg-white/5
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        text-zinc-400
                                                        transition
                                                        hover:text-white
                                                    "
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        </div>

                                    ) : (

                                        /* Normal comment */
                                        <>
                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    justify-between
                                                    gap-x-2
                                                    gap-y-1
                                                "
                                            >

                                                {/* Username + timestamp */}
                                                <div
                                                    className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-x-2
                                                        gap-y-1
                                                    "
                                                >

                                                    <p className="font-medium">
                                                        @{comment.username}
                                                    </p>

                                                    <span
                                                        className="
                                                            text-xs
                                                            text-zinc-500
                                                        "
                                                    >
                                                        {formatRelativeTime(
                                                            comment.createdAt
                                                        )}
                                                    </span>

                                                </div>

                                                {/* Owner actions */}
                                                {isCommentOwner && (
                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-1
                                                            opacity-100
                                                            transition
                                                            sm:opacity-0
                                                            sm:group-hover:opacity-100
                                                        "
                                                    >
                                                        <button
                                                            onClick={() => handleEditStart(comment)}
                                                            className="
                                                                rounded-full
                                                                p-1.5
                                                                text-zinc-500
                                                                transition
                                                                hover:bg-white/5
                                                                hover:text-purple-400
                                                            "
                                                            aria-label="Edit comment"
                                                        >
                                                            <FiEdit2 size={14} />
                                                        </button>
                                                
                                                        <button
                                                            onClick={() => handleDelete(comment.id)}
                                                            className="
                                                                rounded-full
                                                                p-1.5
                                                                text-zinc-500
                                                                transition
                                                                hover:bg-red-500/10
                                                                hover:text-red-400
                                                            "
                                                            aria-label="Delete comment"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                            </div>

                                            {/* Comment text */}
                                            <p
                                                className="
                                                    mt-1
                                                    wrap-break-word
                                                    text-sm
                                                    leading-relaxed
                                                    text-zinc-400
                                                "
                                            >
                                                {comment.text}
                                            </p>
                                        </>
                                    )}

                                </div>

                            </div>
                        );
                    })
                )}

            </div>

            {/* New comment input */}
            <div
                className="
                    mt-6
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                "
            >

                <input
                    value={newComment}
                    onChange={(event) =>
                        setNewComment(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment..."
                    className="
                        min-w-0
                        flex-1
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-5
                        py-3
                        text-sm
                        text-white
                        outline-none
                        transition
                        placeholder:text-zinc-600
                        focus:border-purple-500/50
                        focus:bg-white/[0.07]
                    "
                />

                <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || !user}
                    className="
                        w-full
                        sm:w-auto
                        sm:px-5
                    "
                >
                    Post
                </Button>

            </div>

            {/* Keyboard hint */}
            <p
                className="
                    mt-2
                    text-xs
                    text-zinc-600
                "
            >
                Press Enter to post
            </p>

        </section>
    );
}

export default CommentsSection;