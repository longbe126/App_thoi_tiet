import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from '@expo/vector-icons';

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import WeatherScreen from "./screens/WeatherScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import HistoryScreen from "./screens/HistoryScreen";
import AdminScreen from "./screens/AdminScreen";
import LogoutScreen from "./screens/LogoutScreen";
import OptionsScreen from "./screens/OptionsScreen";
import ExportScreen from "./screens/ExportScreen";
import WeatherDetailScreen from './screens/WeatherDetailScreen'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const OptionsStack = createNativeStackNavigator();
const WeatherStackNavigator = createNativeStackNavigator();

function OptionsNavigator() {
  return (
    <OptionsStack.Navigator>
      <OptionsStack.Screen 
        name="OptionsRoot" 
        component={OptionsScreen} 
        options={{ title: 'Tùy chọn' }} 
      />
      <OptionsStack.Screen 
        name="Export" 
        component={ExportScreen} 
        options={{ title: 'Xuất dữ liệu' }} 
      />
      <OptionsStack.Screen 
        name="Logout" 
        component={LogoutScreen} 
        options={{ headerShown: false }} 
      />
    </OptionsStack.Navigator>
  );
}

function WeatherStack() {
  return (
    <WeatherStackNavigator.Navigator>
      <WeatherStackNavigator.Screen 
        name="WeatherRoot" 
        component={WeatherScreen} 
        options={{ headerShown: false }} 
      />
      <WeatherStackNavigator.Screen 
        name="WeatherDetail" 
        component={WeatherDetailScreen} 
        options={{ title: 'Chi tiết thời tiết' }}
      />
    </WeatherStackNavigator.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Weather') iconName = 'sun';
          else if (route.name === 'Favorites') iconName = 'heart';
          else if (route.name === 'History') iconName = 'clock';
          else if (route.name === 'Options') iconName = 'settings';
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Weather" 
        component={WeatherStack} 
        options={{ title: "Thời tiết", headerShown: false }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: "Yêu thích" }} 
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: "Lịch sử" }} 
      />
      <Tab.Screen 
        name="Options" 
        component={OptionsNavigator} 
        options={{ title: "Tùy chọn", headerShown: false }} 
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Weather') iconName = 'sun';
          else if (route.name === 'Favorites') iconName = 'heart';
          else if (route.name === 'History') iconName = 'clock';
          else if (route.name === 'Admin') iconName = 'user-check';
          else if (route.name === 'Options') iconName = 'settings';
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Weather" 
        component={WeatherStack} 
        options={{ title: "Thời tiết", headerShown: false }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: "Yêu thích" }} 
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: "Lịch sử" }} 
      />
      <Tab.Screen 
        name="Admin" 
        component={AdminScreen} 
        options={{ title: "Quản trị" }} 
      />
      <Tab.Screen 
        name="Options" 
        component={OptionsNavigator} 
        options={{ title: "Tùy chọn", headerShown: false }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: "Đăng ký" }} 
        />
        <Stack.Screen 
          name="Main" 
          options={{ headerShown: false }}
        >
          {({ route }) => {
            const role = route.params?.role || 'user';
            return role === "admin" ? <AdminTabs /> : <MainTabs />;
          }}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}