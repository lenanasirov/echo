import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { markNotificationSent } from "../store/slices/echoCyclesSlice";

function useEchoNotification() {
    const dispatch = useDispatch();

    const { cycle } = useSelector(
        (state) => state.echoCycle
    );

    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        if (!cycle || !cycle.notificationPending || cycle.notificationSent) {
            return;
        }

        const timeout = setTimeout(() => {
            setShowNotification(true);
            dispatch(markNotificationSent());
        }, 0);

        // const notificationTime = new Date(
        //     cycle.nextNotificationAt
        // ).getTime();

        // const now = Date.now();

        // // Notification time has already arrived.
        // if (now >= notificationTime) {
        //     const timeout = setTimeout(() => {
        //         setShowNotification(true);
        //         dispatch(markNotificationSent());
        //     }, 0);
        //     return () => clearTimeout(timeout);
        // }

        // // Wait until the notification time.
        // const timeout = setTimeout(() => {
        //     setShowNotification(true);
        //     dispatch(markNotificationSent());
        // }, notificationTime - now);

        return () => clearTimeout(timeout);

    }, [cycle, dispatch]);

    const dismissNotification = () => {
        setShowNotification(false);
    };

    return {
        showNotification,
        dismissNotification
    };
}

export default useEchoNotification;