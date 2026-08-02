import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("echo-user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    console.log("Auth user:", user);

    const login = (userData) => {

        const loggedUser = {
            id: 1,
            name: "Lena",
            avatar: "🌸",
            email: userData.email
        };

        setUser(loggedUser);

            localStorage.setItem(
            "echo-user",
            JSON.stringify(loggedUser)
        );
    };

    const register = (userData) => {

        const newUser = {
            id: 1,
            name: userData.username,
            avatar: "🌸",
            email: userData.email
        };

        setUser(newUser);

        localStorage.setItem(
            "echo-user",
            JSON.stringify(newUser)
        );
    };

    const logout = () => {

        setUser(null);

        localStorage.removeItem("echo-user");
        
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

