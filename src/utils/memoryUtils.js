export function isMemoryOwner(memory, user) {
    return Boolean(memory && user && memory.user?.id === user.id);
}