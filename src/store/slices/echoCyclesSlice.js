import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { saveToStorage, getFromStorage } from "../../utils/storage";

import {
    getEchoCycles,
    createEchoCycle
} from "../../services/echoCycleService";

import { getRandomReminderTime } from "../../utils/echoCycle";

function getInitialCycleUIState() {
    return (
        getFromStorage("echo-cycle-ui") || {
            cycleId: null,
            notificationSent: false,
            notificationPending: false,
            reminderAt: null,
            reminderSent: false
        }
    );
}

const initialState = {
    // The Echo Cycle itself is owned by the backend.
    cycle: null,

    // Frontend-only notification/reminder state.
    ui: getInitialCycleUIState(),

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

            saveToStorage("echo-cycle-ui", {
                cycleId: state.cycle.id,
                notificationSent:
                    state.ui.notificationSent,
                notificationPending:
                    state.ui.notificationPending,
                reminderAt:
                    state.ui.reminderAt,
                reminderSent:
                    state.ui.reminderSent
            });
        },

        markNotificationSent: (state) => {
            if (!state.cycle) {
                return;
            }

            state.ui.notificationSent = true;
            state.ui.notificationPending = false;

            saveToStorage("echo-cycle-ui", {
                cycleId: state.cycle.id,
                notificationSent:
                    state.ui.notificationSent,
                notificationPending:
                    state.ui.notificationPending,
                reminderAt:
                    state.ui.reminderAt,
                reminderSent:
                    state.ui.reminderSent
            });
        },

        markReminderSent: (state) => {
            if (!state.cycle) {
                return;
            }

            state.ui.reminderSent = true;

            saveToStorage("echo-cycle-ui", {
                cycleId: state.cycle.id,
                notificationSent:
                    state.ui.notificationSent,
                notificationPending:
                    state.ui.notificationPending,
                reminderAt:
                    state.ui.reminderAt,
                reminderSent:
                    state.ui.reminderSent
            });
        }
    },

    extraReducers: (builder) => {
        builder

            // --------------------------------------------------
            // Fetch cycles
            // --------------------------------------------------

            .addCase(fetchEchoCycles.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(fetchEchoCycles.fulfilled, (state, action) => {
                state.status = "success";
                state.error = null;

                const latestCycle = action.payload[0];

                // No cycles exist in the backend.
                // useEchoCycle will create the first one.
                if (!latestCycle) {
                    state.cycle = null;
                    return;
                }

                const storedUIState =
                    getFromStorage("echo-cycle-ui");

                /*
                 * The stored UI state belongs to the same
                 * backend cycle.
                 */
                if (
                    storedUIState &&
                    storedUIState.cycleId === latestCycle.id
                ) {
                    state.ui = {
                        cycleId: storedUIState.cycleId,

                        notificationSent:
                            storedUIState.notificationSent,

                        notificationPending:
                            storedUIState.notificationPending,

                        reminderAt:
                            storedUIState.reminderAt,

                        reminderSent:
                            storedUIState.reminderSent
                    };
                } else {
                    /*
                     * The backend has a cycle, but this browser
                     * has no UI state for that cycle yet.
                     */
                    const reminderAt =
                        getRandomReminderTime(
                            new Date(
                                latestCycle.startedAt
                            )
                        ).toISOString();

                    state.ui = {
                        cycleId: latestCycle.id,

                        notificationSent: false,

                        notificationPending: false,

                        reminderAt,

                        reminderSent: false
                    };

                    saveToStorage("echo-cycle-ui", {
                        cycleId: latestCycle.id,

                        notificationSent: false,

                        notificationPending: false,

                        reminderAt,

                        reminderSent: false
                    });
                }

                // The cycle itself comes only from the backend.
                state.cycle = latestCycle;
            })

            .addCase(fetchEchoCycles.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // --------------------------------------------------
            // Create cycle
            // --------------------------------------------------

            .addCase(postEchoCycle.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })

            .addCase(postEchoCycle.fulfilled, (state, action) => {
                state.status = "success";
                state.error = null;

                /*
                 * The actual cycle comes from the backend.
                 */
                state.cycle = action.payload.backendCycle;

                /*
                 * Notification/reminder state remains
                 * frontend-only.
                 */
                state.ui = {
                    cycleId: state.cycle.id,

                    notificationSent:
                        action.payload.frontendCycle.notificationSent,

                    notificationPending:
                        action.payload.frontendCycle.notificationPending,

                    reminderAt:
                        action.payload.frontendCycle.reminderAt,

                    reminderSent:
                        action.payload.frontendCycle.reminderSent
                };

                saveToStorage("echo-cycle-ui", {
                    cycleId: state.ui.cycleId,

                    notificationSent:
                        state.ui.notificationSent,

                    notificationPending:
                        state.ui.notificationPending,

                    reminderAt:
                        state.ui.reminderAt,

                    reminderSent:
                        state.ui.reminderSent
                });
            })

            .addCase(postEchoCycle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    }
});

export const {
    startCycle,
    markNotificationSent,
    markReminderSent
} = echoCyclesSlice.actions;

export const echoCyclesReducer = echoCyclesSlice.reducer;

