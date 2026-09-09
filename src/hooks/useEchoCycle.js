import { useEffect, useRef } from "react";

import { useSelector, useDispatch } from "react-redux";

import {
    getCurrentEchoCycle,
    createEchoCycle
} from "../utils/echoCycle";

import {
    fetchEchoCycles,
    postEchoCycle
} from "../store/slices/echoCyclesSlice";

import { useAuth } from "./useAuth";

function useEchoCycle() {

    const dispatch = useDispatch();

    const cycle = useSelector(
        (state) => state.echoCycle.cycle
    );

    const cycleStatus = useSelector(
        (state) => state.echoCycle.status
    );

    const memories = useSelector(
        (state) => state.memories.memories
    );

    const memoriesStatus = useSelector(
        (state) => state.memories.status
    );

    const { user, updateProfile } = useAuth();

    // Prevent creating the same cycle more than once.
    const isCreatingCycle = useRef(false);

    // Fetch cycles from the backend when the app starts.
    useEffect(() => {

        if (cycleStatus === "idle") {
            dispatch(fetchEchoCycles());
        }

    }, [cycleStatus, dispatch]);


    // Handle the current cycle.
    useEffect(() => {

        if (
            cycleStatus !== "success" || 
            memoriesStatus !== "success"
        ) {
            return;
        }

        // No cycle exists in the backend.
        // Create the first cycle.
        if (!cycle) {

            if (isCreatingCycle.current) {
                return;
            }

            isCreatingCycle.current = true;

            const newCycle = createEchoCycle();

            dispatch(postEchoCycle(newCycle))
                .finally(() => {
                    isCreatingCycle.current = false;
                });

            return;
        }

        const currentCycle = getCurrentEchoCycle(cycle);

        // The current cycle has ended.
        if (cycle.id !== currentCycle.id) {

            const postedInPreviousCycle = memories.some(
                (memory) =>
                    memory.user?.id === user?.id &&
                    memory.cycleId === cycle.id
            );

            // The user missed the previous cycle.
            if (
                !postedInPreviousCycle &&
                user?.streak > 0
            ) {
                updateProfile({
                    streak: 0,
                    lastStreakCycleId: null
                });
            }

            // Prevent duplicate cycle creation.
            if (isCreatingCycle.current) {                
                return;
            }

            isCreatingCycle.current = true;

            // Create the new cycle in the backend.
            dispatch(postEchoCycle(currentCycle))
                .finally(() => {
                    isCreatingCycle.current = false;
                });
            
        }

    }, [
        cycle,
        cycleStatus,
        memoriesStatus,
        memories,
        user,
        updateProfile,
        dispatch
    ]);

    return cycle;
}

export default useEchoCycle;

