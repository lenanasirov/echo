import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { getCurrentEchoCycle } from "../utils/echoCycle";
import { startCycle } from "../store/slices/echoCyclesSlice";
import { useAuth } from "./useAuth";

function useEchoCycle() {
    const dispatch = useDispatch();

    const cycle = useSelector(
        (state) => state.echoCycle.cycle
    );

    const memories = useSelector(
        (state) => state.memories.memories
    );

    const { user, updateProfile } = useAuth();

    useEffect(() => {
        const currentCycle = getCurrentEchoCycle(cycle);

        // First cycle — there is no previous cycle to check.
        if (!cycle) {
            dispatch(startCycle(currentCycle));
            return
        }
        
        // A new cycle has started.
        if (cycle.id !== currentCycle.id) {

            const postedInPreviousCycle = memories.some(
                (memory) => memory.user?.id=== user?.id &&
                            memory.cycleId === cycle.id
            );

            // The user missed the previous cycle.
            if (!postedInPreviousCycle && user?.streak > 0) {
                updateProfile({
                    streak: 0,
                    lastStreakCycleId: null
                })
            }

            dispatch(startCycle(currentCycle));
        }

    }, [cycle, memories, user, updateProfile, dispatch]);

    return cycle;
}

export default useEchoCycle;