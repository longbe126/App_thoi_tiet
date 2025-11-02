import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogoutScreen({ navigation }) {
  useEffect(() => {
    const doLogout = async () => {
      
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("userId");


      navigation.replace("Login");
    };

    doLogout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4facfe" />
      <Text style={styles.text}>Đang đăng xuất...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
