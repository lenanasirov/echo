import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { 
    saveToStorage,
    getFromStorage,
    removeFromStorage
} from "../utils/storage";
import { updateUser } from "../services/userService";

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

    const updateProfile = async (profileData) => {

        if (!user) {
            return;
        }

        try {
            const response = await updateUser(
                user.id, 
                {
                    ...user,
                    ...profileData
                }
            );

            const updatedUser = response.data;

            setUser(updatedUser);

            saveToStorage("echo-user", updatedUser);

            return true;
        } catch (error) {
            console.error("Failed to update user:", error);
            return false;
        }
    };

    const updateStreak = async (cycle) => {
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
    
        await updateProfile({
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

