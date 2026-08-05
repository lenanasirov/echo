import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { 
    saveToStorage,
    getFromStorage,
    removeFromStorage
} from "../utils/storage";

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        return getFromStorage("echo-user");
    });

    const login = (userData) => {

        const loggedUser = {
            id: 1,
            name: "Lena",
            avatar: "🌸",
            email: userData.email
        };

        setUser(loggedUser);

        saveToStorage("echo-user", loggedUser);
    };

    const register = (userData) => {

        const newUser = {
            id: 1,
            name: userData.username,
            avatar: "🌸",
            email: userData.email
        };

        setUser(newUser);

        saveToStorage("echo-user", newUser);
    };

    const logout = () => {

        setUser(null);

        removeFromStorage("echo-user");
    };

    return (
        <AuthContext.Provider
            value={{
                user, 
                login,
                register, 
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

