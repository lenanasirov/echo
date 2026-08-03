import { createSlice } from "@reduxjs/toolkit";

import nightDrive from "../../assets/mock-images/night-drive.jpg";
import nightRain from "../../assets/mock-images/night-rain.jpg";
import summerSunset from "../../assets/mock-images/summer-sunset.jpg";

const initialState = {
    data: [
        {
            id: 1,

            user: {
                name: "Len",
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

            comments: 3
        },


        {
            id: 2,

            user: {
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

            comments: 5
        },


        {
            id: 3,

            user: {
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

            comments: 4
        }
    ]
};

const memoriesSlice = createSlice({
    name: "memories",
    initialState,
    reducers: {
        addMemory: (state, action) => {
            state.data = [
                action.payload,
                ...state.data
            ];
        }
    }
});

export const {addMemory} = memoriesSlice.actions;

export const memoriesReducer = memoriesSlice.reducer;