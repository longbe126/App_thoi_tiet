import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// --- Import các màn hình ---
import HomeScreen from "./screens/HomeScreen"; 
import FavoritesScreen from "./screens/FavoritesScreen";
import HistoryScreen from "./screens/HistoryScreen";
import LogoutScreen from "./screens/LogoutScreen";
import OptionsScreen from "./screens/OptionsScreen";
import ExportScreen from "./screens/ExportScreen";
import WeatherDetailScreen from "./screens/WeatherDetailScreen";

// 🔥 IMPORT ADMIN NAVIGATOR
import AdminNavigator from "./navigation/AdminNavigator";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const OptionsStack = createNativeStackNavigator();
const WeatherStackNavigator = createNativeStackNavigator();

// --- Navigator con cho tab Tùy chọn ---
function OptionsNavigator() {
  return (
    <OptionsStack.Navigator>
      <OptionsStack.Screen name="OptionsRoot" component={OptionsScreen} options={{ title: "Tùy chọn" }} />
      <OptionsStack.Screen name="Export" component={ExportScreen} options={{ title: "Xuất dữ liệu" }} />
      <OptionsStack.Screen name="Logout" component={LogoutScreen} options={{ headerShown: false }} />
    </OptionsStack.Navigator>
  );
}

// --- Navigator con cho tab Trang chủ ---
function WeatherStack() {
  return (
    <WeatherStackNavigator.Navigator>
      <WeatherStackNavigator.Screen 
        name="WeatherRoot" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <WeatherStackNavigator.Screen 
        name="WeatherDetail" 
        component={WeatherDetailScreen} 
        options={{ headerShown: false }} 
      />
    </WeatherStackNavigator.Navigator>
  );
}

// --- THANH MENU DƯỚI (BOTTOM TABS) ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 1. Cấu hình màu sắc khi chọn/không chọn
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        // 2. Cấu hình Icon theo tên route
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Weather') {
            iconName = 'home'; // Icon ngôi nhà cho Trang chủ
          } else if (route.name === 'Favorites') {
            iconName = 'heart'; // Icon trái tim
          } else if (route.name === 'History') {
            iconName = 'clock'; // Icon đồng hồ
          } else if (route.name === 'Options') {
            iconName = 'settings'; // Icon bánh răng cho Tùy chọn
          }

          // Trả về icon Feather
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Tab 1: Trang chủ */}
      <Tab.Screen 
        name="Weather" 
        component={WeatherStack} 
        options={{ 
          headerShown: false, 
          title: "Trang chủ" // Tên hiển thị tiếng Việt
        }} 
      />

      

      {/* Tab 3: Lịch sử */}
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ 
          title: "Lịch sử",
          headerShown: false
        }}
      />

      {/* Tab 4: Tùy chọn */}
      <Tab.Screen 
        name="Options" 
        component={OptionsNavigator} 
        options={{ 
          headerShown: false,
          title: "Tùy chọn" 
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Màn hình Favorites dùng chung trong Stack để điều hướng từ nút Home */}
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{ title: 'Vị trí đã lưu' }} 
        />

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