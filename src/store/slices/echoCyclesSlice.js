import { createSlice } from "@reduxjs/toolkit";
import { saveToStorage, getFromStorage } from "../../utils/storage";

const initialState= {
    cycle: getFromStorage("echo-cycle") || null
};

const echoCyclesSlice = createSlice({
    name: "echoCycle",

    initialState,

    reducers: {
        startCycle: (state, action) => {
            state.cycle = action.payload;

            saveToStorage("echo-cycle", state.cycle);
        },

        markNotificationSent: (state) => {
            if (!state.cycle) {
                return;
            }

            state.cycle.notificationSent = true; //The notification for this cycle has been triggered.
            state.cycle.notificationPending = false; // There is no longer a pending notification for this cycle.

            saveToStorage("echo-cycle", state.cycle);
        },

        markReminderSent: (state) => {
            if (!state.cycle) {
                return;
            }
        
            state.cycle.reminderSent = true;
        
            saveToStorage(
                "echo-cycle",
                state.cycle
            );
        },
    }
});

export const {
    startCycle,
    markNotificationSent,
    markReminderSent
} = echoCyclesSlice.actions;

export const echoCyclesReducer = echoCyclesSlice.reducer;