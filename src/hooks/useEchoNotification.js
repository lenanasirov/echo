import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";

import {
    markNotificationSent,
    markReminderSent
} from "../store/slices/echoCyclesSlice";

import { useAuth } from "./useAuth";

function useEchoNotification() {

    const dispatch = useDispatch();

    const { user } = useAuth();

    const cycle  = useSelector(
        (state) => state.echoCycle.cycle
    );

    const cycleUI = useSelector(
        (state) => state.echoCycle.ui
    );

    const { memories, status: memoriesStatus } = useSelector(
        (state) => state.memories
    );

    const [notification, setNotification] = useState(null);

    useEffect(() => {

        if (!cycle || !cycleUI || !user) {
            return;
        }

        if (memoriesStatus !== "success") {
            return;
        }

        /* 
        * Make sure the UI state belongs to the current cycle. 
        */
        if (cycleUI.cycleId !== cycle.id) {
            return;
        }

        /*
         * Check whether the current user has already
         * created an Echo during this cycle.
         */
        const hasEchoThisCycle = memories.some(
            (memory) =>
                memory.cycleId === cycle.id &&
                memory.user?.id === user.id
        );

        /*
         * ------------------------------------------------
         * 1. NEW CYCLE NOTIFICATION
         * ------------------------------------------------
         *
         * This notification is triggered when a new cycle
         * starts. It is already marked as pending by
         * getCurrentEchoCycle().
         */
        if (
            cycleUI.notificationPending &&
            !cycleUI.notificationSent
        ) {
            const timeout = setTimeout(() => {

                setNotification({
                    type: "new-cycle"
                });

                dispatch(markNotificationSent());

            }, 0);

            return () => clearTimeout(timeout);
        }

        /*
         * ------------------------------------------------
         * 2. REMINDER NOTIFICATION
         * ------------------------------------------------
         *
         * Only schedule the reminder if the user has NOT
         * created an Echo during the current cycle.
         */
        if (
            !hasEchoThisCycle &&
            !cycleUI.reminderSent &&
            cycleUI.reminderAt
        ) {

            const reminderTime =
                new Date(cycleUI.reminderAt).getTime();

            const now = Date.now();

            const delay = Math.max(
                reminderTime - now,
                0
            );

            const timeout = setTimeout(() => {

                setNotification({
                    type: "reminder"
                });

                dispatch(markReminderSent());

            }, delay);

            return () => clearTimeout(timeout);
        }

    }, [
        cycle,
        cycleUI,
        memories,
        memoriesStatus,
        user,
        dispatch
    ]);

    const dismissNotification = () => {
        setNotification(null);
    };

    return {
        notification,
        dismissNotification
    };
}

export default useEchoNotification;