/**
 * Cross-tab Echo session change signal. The session cookie remains HttpOnly;
 * neither tokens nor user identity are stored in localStorage.
 */
export const AUTH_SESSION_CHANGE_KEY = "echo:auth-session-changed";

export function notifyAuthSessionChange(storage, createNonce = () =>
    `${Date.now()}-${Math.random()}`
) {
    try {
        // Access the storage property inside this try block as some privacy
        // modes throw just by reading window.localStorage.
        const target = storage ?? window.localStorage;
        if (!target || typeof target.setItem !== "function") return false;
        target.setItem(AUTH_SESSION_CHANGE_KEY, createNonce());
        return true;
    } catch {
        // Storage may be disabled. AuthProvider also rechecks /auth/me on focus.
        return false;
    }
}

export function subscribeToAuthSessionChanges(browserWindow, callback) {
    const onStorage = (event) => {
        if (event.key === AUTH_SESSION_CHANGE_KEY && event.newValue) {
            callback();
        }
    };
    browserWindow.addEventListener("storage", onStorage);
    return () => browserWindow.removeEventListener("storage", onStorage);
}

export function didEchoUserChange(previousUserId, nextUserId) {
    return String(previousUserId ?? "") !== String(nextUserId ?? "");
}
