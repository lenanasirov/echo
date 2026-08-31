function getRandomCycleEndTime(startDate = new Date()) {
    const endDate = new Date(startDate);

    // Move to the next calendar day
    endDate.setDate(
        endDate.getDate() + 1
    );

    const startHour = 10;
    const endHour = 20;

    const randomHour =
        Math.floor(
            Math.random() * (endHour - startHour)
        ) + startHour;

    const randomMinute =
        Math.floor(Math.random() * 60);

    endDate.setHours(
        randomHour,
        randomMinute,
        0,
        0
    );

    return endDate;
}

function getRandomReminderTime(startDate = new Date()) {
    const reminderDate = new Date(startDate);

    // Remind the user a few hours after the cycle starts.
    const minHours = 3;
    const maxHours = 5;

    const randomHours =
        Math.floor(
            Math.random() * (maxHours - minHours + 1)
        ) + minHours;

    reminderDate.setHours(
        reminderDate.getHours() + randomHours
    );

    return reminderDate;
}

function createEchoCycle(startDate = new Date(), notificationPending = false, previousCycleId = null) { 
    const endDate =
        getRandomCycleEndTime(startDate);

    const reminderDate =
        getRandomReminderTime(startDate);

    return {
        id: `cycle-${startDate.getTime()}`,
        startedAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        previousCycleId,

        notificationSent: false,
        notificationPending,

        reminderAt: 
            reminderDate.toISOString(),
        reminderSent: false
    };
}

function getCurrentEchoCycle(existingCycle, now = new Date()) {
    if (!existingCycle) {
        return createEchoCycle(now);
    }

    const endsAt =
        new Date(existingCycle.endsAt);

    if (now >= endsAt) {
        return createEchoCycle(now, true, existingCycle.id);
    }

    return existingCycle;
}

export {
    getRandomCycleEndTime,
    getRandomReminderTime,
    createEchoCycle,
    getCurrentEchoCycle
};