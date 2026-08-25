import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { 
    saveToStorage,
    getFromStorage,
    removeFromStorage
} from "../utils/storage";

function createUser(userData) {
    return {
        id: Date.now(),
        name: userData.username,
        username: userData.username,
        avatar: "🌸",
        email: userData.email,
        bio: "",
        streak: 0,
        lastStreakCycleId: null
    };
}

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        return getFromStorage("echo-user");
    });

    const login = (userData) => {

        const users = getFromStorage("echo-users") || [];

        const existingUser = users.find(
            (user) => user.email === userData.email
        );

        if (!existingUser) {
            return false;
        }

        const migratedUser = {
            streak: 0,
            lastStreakCycleId: null,
            ...existingUser
        };

        setUser(migratedUser);
        saveToStorage("echo-user", migratedUser);

        return true;
    };

    const register = (userData) => {

        const users = getFromStorage("echo-users") || [];

        const existingUser = users.find(
            (user) => user.email === userData.email
        );

        if (existingUser) {
            return false;
        }

        const newUser = createUser(userData);

        setUser(newUser);

        saveToStorage("echo-user", newUser);

        saveToStorage("echo-users", [
            ...users,
            newUser
        ]);

        return true;
    };

    const updateProfile = (profileData) => {

        if (!user) {
            return;
        }

        const updatedUser = {
            ...user,
            ...profileData
        };

        setUser(updatedUser);

        // Update active session
        saveToStorage("echo-user", updatedUser);

        const users = getFromStorage("echo-users") || [];

        const updatedUsers = users.map((storedUser) =>
            storedUser.id === updatedUser.id
                ? updatedUser
                : storedUser
        );

        saveToStorage("echo-users", updatedUsers);
    };

    const updateStreak = (cycle) => {
        if (!user || !cycle) {
            return;
        }
    
        // Only count one Echo per cycle.
        if (user.lastStreakCycleId === cycle.id) {
            return;
        }
    
        const currentStreak = user.streak || 0;
        const lastCycleId = user.lastStreakCycleId || null;
    
        const newStreak =
            lastCycleId === cycle.previousCycleId
                ? currentStreak + 1
                : 1;
    
        updateProfile({
            streak: newStreak,
            lastStreakCycleId: cycle.id
        });
    };

    const logout = () => {

        setUser(null);

        // Only remove the active session.
        // The actual user account remains stored.
        removeFromStorage("echo-user");
    };

    return (
        <AuthContext.Provider
            value={{
                user, 
                login,
                register, 
                updateProfile,
                updateStreak,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

