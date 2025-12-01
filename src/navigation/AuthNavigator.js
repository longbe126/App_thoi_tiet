import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

import UserNavigator from "./UserNavigator";
import AdminNavigator from "./AdminNavigator";
import LoginScreen from "../screens/LoginScreen";

export default function AuthNavigator() {
    const { user } = useContext(AuthContext);

    return (
        <NavigationContainer>
            {user == null ? (
                <LoginScreen />
            ) : user.role === "admin" ? (
                <AdminNavigator />
            ) : (
                <UserNavigator />
            )}
        </NavigationContainer>
    );
}
