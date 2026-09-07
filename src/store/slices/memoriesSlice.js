import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { 
    getMemories,
    createMemory as createMemoryRequest
} from "../../services/memoryService";


const initialState = {
    memories: [],
    status: "idle",
    error: null
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
        },

        toggleLike: (state, action) => {
            const {memoryId, userId} = action.payload;

            const memory = state.memories.find(
                (memory) => memory.id === memoryId
            );

            if (!memory) {
                return;
            }

            if (!memory.likedBy) {
                memory.likedBy = [];
            }

            const userIndex = memory.likedBy.indexOf(userId);

            if (userIndex === -1) {
                memory.likedBy.push(userId);
                memory.likes++;
            } else {
                memory.likedBy.splice(userIndex, 1);
                memory.likes--;
            }
        },

        addComment: (state, action) => {
            const {memoryId, comment} = action.payload;

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
        },

        updateComment: (state, action) => {
            const {memoryId, commentId, text} = action.payload;

            const memory = state.memories.find(
                (memory) => memory.id === memoryId
            );

            if (!memory) {
                return;
            }

            const comment = memory.comments.find(
                (comment) => comment.id === commentId
            );

            if (!comment) {
                return;
            }

            comment.text = text;
        },

        deleteComment: (state, action) => {
            const {memoryId, commentId} = action.payload;

            const memory = state.memories.find(
                (memory) => memory.id === memoryId
            );

            if (!memory) {
                return;
            }

            memory.comments = memory.comments.filter(
                (comment) => comment.id !== commentId
            );
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
            });
    }
});

export const {
    addMemory, 
    updateMemory, 
    deleteMemory, 
    toggleLike, 
    addComment, 
    updateComment, 
    deleteComment
} = memoriesSlice.actions;


export const memoriesReducer = memoriesSlice.reducer;