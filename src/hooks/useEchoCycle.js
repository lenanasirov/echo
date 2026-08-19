import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { getCurrentEchoCycle } from "../utils/echoCycle";
import { startCycle } from "../store/slices/echoCyclesSlice";

function useEchoCycle() {
    const dispatch = useDispatch();

    const cycle = useSelector(
        (state) => state.echoCycle.cycle
    );

    useEffect(() => {
        const currentCycle = getCurrentEchoCycle(cycle);

        if (!cycle || cycle.id !== currentCycle.id) {
            dispatch(startCycle(currentCycle));
        }
    }, [cycle, dispatch]);

    return cycle;
}

export default useEchoCycle;