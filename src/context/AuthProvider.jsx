import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const login = (credentials) => {

        const loggedUser = {
            id: 1,
            name: "Lena",
            avatar: "🌸",
            email: credentials.email
        };

        setUser(loggedUser);
    };

    const register = (userData) => {

        const newUser = {
            id: 1,
            name: userData.username,
            avatar: "🌸",
            email: userData.email
        };

        setUser(newUser);
    };

    const logout = () => {
        setUser(null);
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

