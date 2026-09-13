import { useState, useEffect } from "react";

import { AuthContext } from "./AuthContext";

import { 
    updateUser 
} from "../services/userService";

import { 
    getCurrentUser,
    loginUser,
    registerUser,
    logoutUser
} from "../services/authService";

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await getCurrentUser();

                setUser(response.data);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);


    const login = async (userData) => {
        try {
            const response = await loginUser({
                email: userData.email,
                password: userData.password
            });

            setUser(response.data);

            return {
                success: true
            };
        } catch (error) {
            console.error("Failed to login:", error);
            
            return {
            success: false,
            message:
                error.response?.data?.message ||
                "Failed to sign in. Please try again."
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await registerUser(
                {
                    name: userData.name || userData.username,
                    username: userData.username,
                    email: userData.email,
                    password: userData.password

                }
            );

            setUser(response.data);

            return {
                success: true
            };
        } catch (error) {
            console.error("Failed to register:", error);

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to create account."
            };
        }
    };

    const updateProfile = async (profileData) => {
        if (!user) {
            return;
        }

        try {
            const response = await updateUser({
                ...user,
                ...profileData  
            });

            const updatedUser = response.data;

            setUser(updatedUser);

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

    const logout = async () => {
        try{
            await logoutUser();
        } catch (error) {
            console.error("Failed to logout:", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user, 
                isLoading,
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

