import { createSlice } from "@reduxjs/toolkit";

import nightDrive from "../../assets/mock-images/night-drive.jpg";
import nightRain from "../../assets/mock-images/night-rain.jpg";
import summerSunset from "../../assets/mock-images/summer-sunset.jpg";
import { saveToStorage, getFromStorage } from "../../utils/storage";

const defaultMemories = [
    {
        id: 1,

        user: {
            id: 1,
            name: "Lena",
            avatar: "🌸"
        },

        image: nightDrive,

        song: {
            title: "Space Song",
            artist: "Beach House"
        },

        mood: "🌙 Nostalgic",

        caption:
            "Late night drive.",

        location:
            "Ashdod, Israel",

        date:
            "July 23, 2026",

        likes: 12,
        likedBy: [],

        comments: 3
    },


    {
        id: 2,

        user: {
            id: 2,
            name: "Maya",
            avatar: "🌻"
        },

        image: summerSunset,

        song: {
            title: "Yellow",
            artist: "Coldplay"
        },

        mood: "☀️ Happy",

        caption:
            "A perfect summer evening.",

        location:
            "Tel Aviv, Israel",

        date:
            "July 20, 2026",

        likes: 24,
        likedBy: [],

        comments: 5
    },


    {
        id: 3,

        user: {
            id: 3,
            name: "Daniel",
            avatar: "🎧"
        },

        image: nightRain,

        song: {
            title: "The Night We Met",
            artist: "Lord Huron"
        },

        mood:
            "💙 Melancholic",

        caption:
            "Some songs stay forever.",

        location:
            "Jerusalem, Israel",

        date:
            "July 18, 2026",

        likes: 18,
        likedBy: [],

        comments: 4
    }
];

const initialState = {
    memories: getFromStorage("echo-memories") || defaultMemories
};

const memoriesSlice = createSlice({
    name: "memories",
    initialState,
    reducers: {
        addMemory: (state, action) => {
            state.memories = [
                action.payload,
                ...state.memories
            ];

            saveToStorage("echo-memories", state.memories);
        },

        updateMemory: (state, action) => {
            const index = state.memories.findIndex(
                (memory) => memory.id === action.payload.id
            );

            if (index !== -1) {
                state.memories[index] = action.payload;
                saveToStorage("echo-memories", state.memories);
            }
        },

        deleteMemory: (state, action) => {
            const index = state.memories.findIndex(
                (memory) => memory.id === action.payload.id
            );

            if (index !== -1) {
                state.memories.splice(index, 1);
                saveToStorage("echo-memories", state.memories);
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

            saveToStorage("echo-memories", state.memories);
        },
    }
});

export const {addMemory, updateMemory, deleteMemory, toggleLike} = memoriesSlice.actions;

export const memoriesReducer = memoriesSlice.reducer;