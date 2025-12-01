import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import WeatherScreen from "./screens/WeatherScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import HistoryScreen from "./screens/HistoryScreen";
import LogoutScreen from "./screens/LogoutScreen";
import OptionsScreen from "./screens/OptionsScreen";
import ExportScreen from "./screens/ExportScreen";
import WeatherDetailScreen from "./screens/WeatherDetailScreen";

// 🔥 IMPORT ADMIN NAVIGATOR MỚI
import AdminNavigator from "./navigation/AdminNavigator";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const OptionsStack = createNativeStackNavigator();
const WeatherStackNavigator = createNativeStackNavigator();

function OptionsNavigator() {
  return (
    <OptionsStack.Navigator>
      <OptionsStack.Screen name="OptionsRoot" component={OptionsScreen} />
      <OptionsStack.Screen name="Export" component={ExportScreen} />
      <OptionsStack.Screen name="Logout" component={LogoutScreen} options={{ headerShown: false }} />
    </OptionsStack.Navigator>
  );
}

function WeatherStack() {
  return (
    <WeatherStackNavigator.Navigator>
      <WeatherStackNavigator.Screen name="WeatherRoot" component={WeatherScreen} options={{ headerShown: false }} />
      <WeatherStackNavigator.Screen name="WeatherDetail" component={WeatherDetailScreen} />
    </WeatherStackNavigator.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Weather: "sun",
            Favorites: "heart",
            History: "clock",
            Options: "settings",
          };
          return <Feather name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Weather" component={WeatherStack} options={{ headerShown: false }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Options" component={OptionsNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        <Stack.Screen name="Main" options={{ headerShown: false }}>
          {({ route }) => {
            const role = route.params?.role || "user";
            return role === "admin" ? <AdminNavigator /> : <MainTabs />;
          }}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
