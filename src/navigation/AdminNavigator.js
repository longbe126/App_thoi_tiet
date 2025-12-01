import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminHomeScreen from "../admin/AdminHomeScreen";
import ManageAccountsScreen from "../admin/ManageAccountsScreen";
import UserDetailScreen from "../admin/UserDetailScreen";
import ManageApiScreen from "../admin/ManageApiScreen";

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: "Quản trị" }}
      />

      {/* 🔥 QUẢN LÝ TÀI KHOẢN */}
      <Stack.Screen
        name="ManageAccounts"
        component={ManageAccountsScreen}
        options={{ title: "Quản lý tài khoản" }}
      />

      {/* 🔥 CHI TIẾT USER */}
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ title: "Chi tiết người dùng" }}
      />

      {/* 🔥 QUẢN LÝ API */}
      <Stack.Screen
        name="ManageApi"
        component={ManageApiScreen}
        options={{ title: "Quản lý API Key" }}
      />

    </Stack.Navigator>
  );
}
