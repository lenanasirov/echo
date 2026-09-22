import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { 
    getMemories,
    createMemory as createMemoryRequest,
    likeMemory as likeMemoryRequest,
    unlikeMemory as unlikeMemoryRequest,
    getMemoryComments,
    createMemoryComment as createMemoryCommentRequest,
    updateMemoryComment as updateMemoryCommentRequest,
    deleteMemoryComment as deleteMemoryCommentRequest
} from "../../services/memoryService";


const initialState = {
    memories: [],
    status: "idle",
    error: null,

    interactionStatus: {
        likes: {},
        comments: {
            fetch: {},
            create: {},
            edit: {},
            delete: {}
        }
    }
};

export const fetchMemories = createAsyncThunk(
    "memories/fetchMemories",
    async (_, { rejectWithValue }) => {
        try {
            const response  = await getMemories();

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch memories"
            );
        }
    }
);

export const createMemory = createAsyncThunk(
    "memories/createMemory",
    async (memoryData, { rejectWithValue }) => {
        try {
            const response = await createMemoryRequest(memoryData);

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to create memory"
            );
        }
    }
);

export const likeMemory = createAsyncThunk(
    "memories/likeMemory",
    async (memoryId, { rejectWithValue }) => {
        try {
            await likeMemoryRequest(memoryId);

            return memoryId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to like memory"
            );
        }
    },
    {
        condition: (memoryId, { getState }) => {
            const state = getState();
            
            return (
                state.memories.interactionStatus.likes[memoryId] !== "loading"
            );
        }
    }
);

export const unlikeMemory = createAsyncThunk(
    "memories/unlikeMemory",
    async (memoryId, { rejectWithValue }) => {
        try {            
            await unlikeMemoryRequest(memoryId);   

            return memoryId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to unlike memory"
            );
        }
    },
    {
        condition: (memoryId, { getState }) => {
            const state = getState();
            
            return (
                state.memories.interactionStatus.likes[memoryId] !== "loading"
            );
        }
    }
);

export const fetchMemoryComments = createAsyncThunk(
    "memories/fetchMemoryComments",
    async (memoryId, { rejectWithValue }) => {
        try {
            const response = await getMemoryComments(memoryId); 

            return {
                memoryId,
                comments: response.data
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch comments"
            );
        }
    },
    {
        condition: (memoryId, { getState }) => {
            const state = getState();
            
            return (
                state.memories.interactionStatus.comments.fetch[memoryId] !== "loading"
            );
        }
    }
);

export const createMemoryComment = createAsyncThunk(
    "memories/createMemoryComment",
    async ({ memoryId, content }, { rejectWithValue }) => {
        try {
            const response = await createMemoryCommentRequest(
                memoryId,
                content
            );

            return {
                memoryId,
                comment: response.data
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to create comment"
            );
        }
    },
    {
        condition: ({ memoryId }, { getState }) => {
            const state = getState();

            return (
                state.memories.interactionStatus.comments.create[memoryId] !== "loading"
            );
        }
    }
);

export const editMemoryComment = createAsyncThunk(
    "memories/editMemoryComment",
    async (
        { memoryId, commentId, content }, 
        { rejectWithValue }
    ) => {
        try {
            const response = await updateMemoryCommentRequest(
                memoryId,
                commentId,
                content
            );

            return {
                memoryId,
                comment: response.data
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to update comment"
            );
        }
    },
    {
        condition: ({ memoryId, commentId }, { getState }) => {
            const state = getState();

            const commentKey = `${memoryId}-${commentId}`;

            return (
                state.memories.interactionStatus.comments.edit[commentKey] !== "loading"
            );
        }
    }
);

export const removeMemoryComment = createAsyncThunk(
    "memories/removeMemoryComment",
    async (
        { memoryId, commentId }, 
        { rejectWithValue }
    ) => {
        try {
            await deleteMemoryCommentRequest(
                memoryId, 
                commentId
            );

            return {
                memoryId,
                commentId
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete comment"
            );
        }
    },
    {
        condition: ({ memoryId, commentId }, { getState }) => {
            const state = getState();

            const commentKey = `${memoryId}-${commentId}`;

            return (
                state.memories.interactionStatus.comments.delete[commentKey] !== "loading"
            );
        }
    }
);

const memoriesSlice = createSlice({
    name: "memories",

    initialState,

    reducers: {
        addMemory: (state, action) => {
            state.memories = [
                action.payload,
                ...state.memories
            ];
        },

        updateMemory: (state, action) => {
            const index = state.memories.findIndex(
                (memory) => memory.id === action.payload.id
            );

            if (index !== -1) {
                state.memories[index] = action.payload;
            }
        },

        deleteMemory: (state, action) => {
            const index = state.memories.findIndex(
                (memory) => memory.id === action.payload.id
            );

            if (index !== -1) {
                state.memories.splice(index, 1);
            }
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchMemories.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(fetchMemories.fulfilled, (state, action) => {
                state.status = "success";
                state.error = null;
                state.memories = action.payload;
            })

            .addCase(fetchMemories.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            .addCase(createMemory.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(createMemory.fulfilled, (state, action) => {
                state.status = "success";
                state.error = null;

                state.memories = [
                    action.payload,
                    ...state.memories
                ];
            })

            .addCase(createMemory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            .addCase(likeMemory.pending, (state, action) => {
                state.interactionStatus.likes[action.meta.arg] = "loading";
            })
            
            .addCase(likeMemory.fulfilled, (state, action) => {
                const memoryId = action.payload;

                state.interactionStatus.likes[memoryId] = "idle";

                const memory = state.memories.find(
                    (memory) => memory.id === memoryId
                );

                if (!memory) {
                    return;
                }

                memory.likes += 1;
                memory.likedByCurrentUser = true;
                
            })

            .addCase(likeMemory.rejected, (state, action) => {
                state.interactionStatus.likes[action.meta.arg] = "idle";
            })

            .addCase(unlikeMemory.pending, (state, action) => {
                state.interactionStatus.likes[action.meta.arg] = "loading";
            })

            .addCase(unlikeMemory.fulfilled, (state, action) => {
                const memoryId = action.payload;

                state.interactionStatus.likes[memoryId] = "idle";

                const memory = state.memories.find(
                    (memory) => memory.id === memoryId
                );

                if (!memory) {
                    return;
                }

                memory.likes -= 1;
                memory.likedByCurrentUser = false;
            })

            .addCase(unlikeMemory.rejected, (state, action) => {
                state.interactionStatus.likes[action.meta.arg] = "idle";
            })

            .addCase(fetchMemoryComments.pending, (state, action) => {
                state.interactionStatus.comments.fetch[action.meta.arg] = "loading";
            })
            
            .addCase(fetchMemoryComments.fulfilled, (state, action) => {
                const { memoryId, comments } = action.payload;

                state.interactionStatus.comments.fetch[memoryId] = "idle";

                const memory = state.memories.find(
                    (memory) => memory.id === memoryId
                );

                if (!memory) {
                    return;
                }

                memory.comments = comments;
            })

            .addCase(fetchMemoryComments.rejected, (state, action) => {
                state.interactionStatus.comments.fetch[action.meta.arg] = "idle";
            })

            .addCase(createMemoryComment.pending, (state, action) => {
                const { memoryId } = action.meta.arg;

                state.interactionStatus.comments.create[memoryId] = "loading";
            })

            .addCase(createMemoryComment.fulfilled, (state, action) => {
                const { memoryId, comment } = action.payload;

                state.interactionStatus.comments.create[memoryId] = "idle";

                const memory = state.memories.find(
                    (memory) => memory.id === memoryId
                );

                if (!memory) {
                    return;
                }

                if (!memory.comments) {
                    memory.comments = [];
                }

                memory.comments.push(comment);
                memory.commentCount += 1;
            })

            .addCase(createMemoryComment.rejected, (state, action) => {
                const { memoryId } = action.meta.arg;

                state.interactionStatus.comments.create[memoryId] = "idle";
            })

            .addCase(editMemoryComment.pending, (state, action) => {
                const { memoryId, commentId } = action.meta.arg;
                const commentKey = `${memoryId}-${commentId}`;

                state.interactionStatus.comments.edit[commentKey] = "loading";
            })

            .addCase(editMemoryComment.fulfilled, (state, action) => {
                const { memoryId, comment } = action.payload;
                const commentKey = `${memoryId}-${comment.id}`;

                state.interactionStatus.comments.edit[commentKey] = "idle";

                const memory = state.memories.find(
                    (memory) => memory.id === memoryId
                );

                if (!memory) {
                    return;
                }

                const commentIndex = memory.comments.findIndex(
                    (existingComment) => existingComment.id === comment.id
                );

                if (commentIndex === -1) {
                    return;
                }

                memory.comments[commentIndex] = comment;
            })

            .addCase(editMemoryComment.rejected, (state, action) => {
                const { memoryId, commentId } = action.meta.arg;
                const commentKey = `${memoryId}-${commentId}`;

                state.interactionStatus.comments.edit[commentKey] = "idle";
            })

            .addCase(removeMemoryComment.pending, (state, action) => {
                const { memoryId, commentId } = action.meta.arg;
                const commentKey = `${memoryId}-${commentId}`;

                state.interactionStatus.comments.delete[commentKey] = "loading";
            })

            .addCase(removeMemoryComment.fulfilled, (state, action) => {
                const { memoryId, commentId } = action.payload;
                const commentKey = `${memoryId}-${commentId}`;

                state.interactionStatus.comments.delete[commentKey] = "idle";

                const memory = state.memories.find(
                    (memory) => memory.id === memoryId
                );

                if (!memory) {
                    return;
                }

                const commentExists = memory.comments.some(
                    (comment) => comment.id === commentId
                );

                if (!commentExists) {
                    return;
                }

                memory.comments = memory.comments.filter(
                    (comment) => comment.id !== commentId
                );

                memory.commentCount -= 1;
            })
            
            .addCase(removeMemoryComment.rejected, (state, action) => {
                const { memoryId, commentId } = action.meta.arg;
                const commentKey = `${memoryId}-${commentId}`;

                state.interactionStatus.comments.delete[commentKey] = "idle";
            });       
    }
});

export const selectLikeLoading = (state, memoryId) =>
    state.memories.interactionStatus.likes[memoryId] === "loading";

export const selectCommentsLoading = (state, memoryId) =>
    state.memories.interactionStatus.comments.fetch[memoryId] === "loading";

export const selectCreateCommentLoading = (state, memoryId) =>
    state.memories.interactionStatus.comments.create[memoryId] === "loading";

export const selectEditCommentLoading = (state, memoryId, commentId) =>
    state.memories.interactionStatus.comments.edit[
        `${memoryId}-${commentId}`
    ] === "loading";

export const selectDeleteCommentLoading = (state, memoryId, commentId) =>
    state.memories.interactionStatus.comments.delete[
        `${memoryId}-${commentId}`
    ] === "loading";

export const {
    addMemory, 
    updateMemory, 
    deleteMemory
} = memoriesSlice.actions;


export const memoriesReducer = memoriesSlice.reducer;