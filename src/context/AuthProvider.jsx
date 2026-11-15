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

import { disconnectSpotify } from "../services/spotifyAuthService";
import { disconnectSpotifyPlayer } from "../services/spotifyPlayerService";
import {
    didEchoUserChange,
    notifyAuthSessionChange,
    subscribeToAuthSessionChanges
} from "../services/authSessionSync";

// Always remove browser-only Spotify credentials and the SDK player before
// changing Echo identities. The encrypted MySQL connection is untouched.
function clearLocalSpotifySession() {
    disconnectSpotify();
    disconnectSpotifyPlayer();
}

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // A change to the shared HttpOnly Echo cookie in another tab does not
    // automatically update this tab's React state or cached Spotify token.
    // Reloading ensures the old runtime cannot keep controlling playback.
    useEffect(() => {
        let active = true;
        let checkingSession = false;
        const currentUserId = user?.id ?? null;

        const resetTab = () => {
            if (!active) return;
            active = false;
            clearLocalSpotifySession();
            window.location.reload();
        };

        const unsubscribe = subscribeToAuthSessionChanges(window, resetTab);

        // Fallback for cookie changes made elsewhere without a broadcast,
        // such as another origin or an expired session. Do not treat network
        // errors as logouts; only an explicit 401 proves authentication ended.
        const verifyOnFocus = async () => {
            if (!active || isLoading || checkingSession || currentUserId == null) return;
            checkingSession = true;
            try {
                const response = await getCurrentUser();
                if (active && didEchoUserChange(currentUserId, response.data?.id)) {
                    resetTab();
                }
            } catch (error) {
                if (active && error?.response?.status === 401) resetTab();
            } finally {
                checkingSession = false;
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") void verifyOnFocus();
        };
        window.addEventListener("focus", verifyOnFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            active = false;
            unsubscribe();
            window.removeEventListener("focus", verifyOnFocus);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [user?.id, isLoading]);

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

            // A successful Echo sign-in changes the browser's auth cookie.
            // Invalidate old local Spotify state and notify other open tabs.
            clearLocalSpotifySession();
            setUser(response.data);
            notifyAuthSessionChange();

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

            clearLocalSpotifySession();
            setUser(response.data);
            notifyAuthSessionChange();

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
        try {
            await logoutUser();
    
            // Spotify authorization stays encrypted in MySQL; only the
            // current tab's token and SDK runtime are destroyed.
            clearLocalSpotifySession();
            setUser(null);
            notifyAuthSessionChange();

            // A full navigation is needed for a fresh Spotify SDK runtime.
            window.location.replace("/login");
        } catch (error) {
            console.error("Failed to logout:", error);
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

