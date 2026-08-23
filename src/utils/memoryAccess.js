import { isMemoryOwner } from "./memoryUtils";

export function isCurrentCycleMemory(memory, currentCycle) {
    return (
        memory?.cycleId &&
        currentCycle?.id &&
        memory.cycleId === currentCycle.id
    );
}

export function canEditMemory(memory, user, currentCycle) {
    return (
        isMemoryOwner(memory, user) &&
        isCurrentCycleMemory(memory, currentCycle) 
    );
}

export function canViewMemory(memory, user, currentCycle, hasCurrentUserPosted) {
    if (!memory || !user || !currentCycle) {
        return false;
    }

    // Your own memories remain accessible through Profile/history.
    if(isMemoryOwner(memory, user)) {
        return true;
    }

    // Other users' old-cycle memories are never accessible.
    if (!isCurrentCycleMemory(memory, currentCycle)) {
        return false;
    }

    // Other users' current-cycle memories
    // require participation in the current cycle.
    return hasCurrentUserPosted;
}

export function isMemoryLocked(memory, user, currentCycle, hasCurrentUserPosted) {
    if (!memory || !user || !currentCycle) {
        return false;
    }

    // Your own memories are never locked.
    if(isMemoryOwner(memory, user)) {
        return false;
    }

    // Only current-cycle memories can have a locked preview.
    if(!isCurrentCycleMemory(memory, currentCycle)) {
        return false;
    }

    // Other users' memories are locked until you post.
    return !hasCurrentUserPosted;

}