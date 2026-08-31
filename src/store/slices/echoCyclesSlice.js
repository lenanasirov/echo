import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { saveToStorage, getFromStorage } from "../../utils/storage";
import { getEchoCycles, createEchoCycle } from "../../services/echoCycleService";
import { getRandomReminderTime } from "../../utils/echoCycle";

const initialState= {
    cycle: getFromStorage("echo-cycle") || null,
    status: "idle",
    error: null
};

export const fetchEchoCycles = createAsyncThunk(
    "echoCycle/fetchEchoCycles",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getEchoCycles();

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch echo cycles"
            );
        }
    }
);

export const postEchoCycle = createAsyncThunk( 
    "echoCycle/postEchoCycle", 
    async (cycleData, { rejectWithValue }) => { 
        try { 
            const response = await createEchoCycle(cycleData); 

            return {
                backendCycle: response.data,
                frontendCycle: cycleData
            };
        } catch (error) { 
            return rejectWithValue(
                 error.response?.data?.message ||
                 error.message || 
                 "Failed to create echo cycle" 
            ); 
        } 
    } 
);


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
    },
    extraReducers: (builder) => {
        builder
            // Fetch cycles
            .addCase(fetchEchoCycles.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(fetchEchoCycles.fulfilled, (state, action) => {
                state.status = "success";
                state.error = null;

                const latestCycle = action.payload[0];

                if(!latestCycle) {
                    state.cycle = null;
                    return;
                }

                const storedCycle = getFromStorage("echo-cycle");

                // The same cycle already exists in localStorage.
                if (storedCycle  && storedCycle.id === latestCycle.id) {
                    state.cycle = {
                        ...storedCycle,

                        // Preserve frontend-only state
                        notificationSent:
                            storedCycle.notificationSent,

                        notificationPending:
                            storedCycle.notificationPending,

                        reminderAt:
                            storedCycle.reminderAt,

                        reminderSent:
                            storedCycle.reminderSent
                    };
                // The backend has a cycle, but this
                // browser has no frontend state for it.
                } else {
                    const reminderAt = 
                        getRandomReminderTime(
                            new Date(
                                latestCycle.startedAt
                            )
                        ).toISOString();

                    state.cycle = {
                        ...latestCycle,

                        // Frontend-only state
                        notificationSent: false,
                        notificationPending: false,
                        reminderAt,
                        reminderSent: false
                    };

                }

                saveToStorage("echo-cycle", state.cycle);
            })

            .addCase(fetchEchoCycles.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Create cycle
            .addCase(postEchoCycle.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(postEchoCycle.fulfilled, (state, action) => {
                state.status = "success";
                state.error = null;

                state.cycle = {
                    ...action.payload.backendCycle,

                    // Preserve frontend-only state
                    notificationSent:
                        action.payload.frontendCycle.notificationSent,

                    notificationPending:
                        action.payload.frontendCycle.notificationPending,

                    reminderAt:
                        action.payload.frontendCycle.reminderAt,

                    reminderSent:
                        action.payload.frontendCycle.reminderSent
                };

                console.log(
                    "Saving newly created cycle:",
                    state.cycle
                );
                saveToStorage("echo-cycle", state.cycle);
            })

            .addCase(postEchoCycle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const {
    startCycle,
    markNotificationSent,
    markReminderSent
} = echoCyclesSlice.actions;

export const echoCyclesReducer = echoCyclesSlice.reducer;