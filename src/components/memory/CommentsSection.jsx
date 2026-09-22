import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    FiEdit2,
    FiTrash2
} from "react-icons/fi";

import { 
    fetchMemoryComments,
    createMemoryComment,
    editMemoryComment,
    removeMemoryComment,
    selectCommentsLoading,
    selectCreateCommentLoading
} from "../../store/slices/memoriesSlice";

import { useAuth } from "../../hooks/useAuth";
import formatRelativeTime from "../../utils/formatRelativeTime";

import Button from "../common/Button";

function CommentsSection({ memory }) {
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const dispatch = useDispatch();

    const { user } = useAuth();

    const isCommentsLoading = useSelector(
        (state) => selectCommentsLoading(state, memory?.id)
    );

    const isCreatingComment = useSelector(
        (state) => selectCreateCommentLoading(state, memory?.id)
    );

    const interactionStatus = useSelector(
        (state) => state.memories.interactionStatus
    );

    useEffect(() => {
        if (!memory?.id) {
            return;
        }

        dispatch(fetchMemoryComments(memory.id));
    }, [memory?.id, dispatch]);

    const comments = memory?.comments || [];

    const handleSubmit = () => {
        if (
            !newComment.trim() || 
            !user || 
            !memory || 
            isCreatingComment
        ){
            return;
        }

        dispatch(
            createMemoryComment({
                memoryId: memory.id,
                content: newComment.trim()
            })
        );

        setNewComment("");
    };

    const handleEditStart =(comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.content);
    };
    
    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditingText("");
    };

    const handleEditSave = async (commentId) => {
        const commentKey = `${memory.id}-${commentId}`;
        const isSavingEdit = interactionStatus.comments.edit[commentKey] === "loading";

        if(!editingText.trim() || isSavingEdit){
            return;
        }

        try {
            await dispatch(
                editMemoryComment({
                    memoryId: memory.id,
                    commentId,
                    content: editingText.trim()
                })
            ).unwrap();

            setEditingCommentId(null);
            setEditingText("");
        } catch {
            // Keep edit mode open so the user can retry.
        }
    };

    const handleDelete = (commentId) => {
        const commentKey = `${memory.id}-${commentId}`;
        const isDeletingComment = interactionStatus.comments.delete[commentKey] === "loading";

        if (isDeletingComment) {
            return;
        }

        dispatch(
            removeMemoryComment({
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
                    {memory?.commentCount ?? 0}
                </span>

            </div>

            {/* Comments */}
            <div className="mt-6 space-y-5">

                {isCommentsLoading ? (
                    <div className="py-8 text-center text-zinc-500">
                        Loading comments...
                    </div>
                ): comments.length === 0 ? (
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
                            comment.user.id === user?.id;

                        const isEditing =
                            editingCommentId === comment.id;

                        const commentKey = `${memory.id}-${comment.id}`;

                        const isSavingEdit = interactionStatus.comments.edit[commentKey] === "loading";
                        
                        const isDeletingComment = interactionStatus.comments.delete[commentKey] === "loading";

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
                                    {comment.user.avatar}
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
                                                disabled={isSavingEdit}
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
                                                    onClick={() => handleEditSave(comment.id)}
                                                    disabled={
                                                        !editingText.trim() ||
                                                        isSavingEdit
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
                                                    {isSavingEdit ? "Saving..." : "Save"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleEditCancel}
                                                    disabled={isSavingEdit}
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
                                                        @{comment.user.username}
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
                                                            disabled={isDeletingComment}
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
                                                            {isDeletingComment ? (
                                                                <span
                                                                    className="
                                                                        inline-block
                                                                        h-3.5
                                                                        w-3.5
                                                                        animate-spin
                                                                        rounded-full
                                                                        border-2
                                                                        border-white/20
                                                                        border-t-red-400
                                                                    "
                                                                />
                                                            ) : (
                                                                <FiTrash2 size={14} />
                                                            )}
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
                                                {comment.content}
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
                    id="comment-input"
                    disabled = {isCreatingComment}
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
                    disabled={
                        !newComment.trim() || 
                        !user ||
                        isCreatingComment
                    }
                    className="
                        w-full
                        sm:w-auto
                        sm:px-5
                    "
                >
                    {isCreatingComment ? "Posting..." : "Post"}
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