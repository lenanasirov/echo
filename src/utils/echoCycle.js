function getRandomNotificationTime(startDate = new Date()) {
    const notificationDate = new Date(startDate);

    // Move to the next calendar day
    notificationDate.setDate(
        notificationDate.getDate() + 1
    );

    const startHour = 10;
    const endHour = 20;

    const randomHour =
        Math.floor(
            Math.random() * (endHour - startHour)
        ) + startHour;

    const randomMinute =
        Math.floor(Math.random() * 60);

    notificationDate.setHours(
        randomHour,
        randomMinute,
        0,
        0
    );

    return notificationDate;
}


function createEchoCycle(startDate = new Date()) {
    const notificationDate =
        getRandomNotificationTime(startDate);

    return {
        id: `cycle-${startDate.getTime()}`,

        startedAt: startDate.toISOString(),

        nextNotificationAt:
            notificationDate.toISOString(),

            notificationSent: false
    };
}

function getCurrentEchoCycle(existingCycle, now = new Date()) {
    if (!existingCycle) {
        return createEchoCycle(now);
    }

    const nextNotificationAt =
        new Date(existingCycle.nextNotificationAt);

    if (now >= nextNotificationAt) {
        return createEchoCycle(now);
    }

    return existingCycle;
}

export {
    getRandomNotificationTime,
    createEchoCycle,
    getCurrentEchoCycle
};