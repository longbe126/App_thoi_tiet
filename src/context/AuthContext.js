import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // login fake để test role
    const login = (email, password) => {
        if (email === "admin@gmail.com") {
            setUser({ email, role: "admin" });
        } else {
            setUser({ email, role: "user" });
        }
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
