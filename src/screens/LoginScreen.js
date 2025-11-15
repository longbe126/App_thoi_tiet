import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ");
    }

    try {
      const res = await fetch("http://10.0.2.2:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) return Alert.alert("Lỗi", data.error);

      // Lưu token
      await AsyncStorage.setItem("token", data.token);

      // ✅ Điều hướng ĐÚNG SANG MÀN HÌNH "Main"
      navigation.replace("Main", { role: data.role });

    } catch (err) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
  };

  return (
    <View style={styles.container}>
      
      {/* LOGO */}
      <Image
        source={require("../../assets/logoDAU.jpg")}
        style={styles.logo}
      />

      {/* TÊN THƯƠNG HIỆU */}
      <Text style={styles.brand}>🌙 Long Night</Text>

      <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>ĐĂNG NHẬP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 80, backgroundColor: "#eef5ff" },

  logo: { width: 100, height: 100, borderRadius: 16, marginBottom: 10 },

  brand: {
    fontSize: 28,
    color: "#3D79FF",
    fontWeight: "bold",
    marginBottom: 4
  },

  subtitle: {
    color: "#555",
    marginBottom: 30
  },

  card: {
    width: "88%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5
  },

  input: {
    backgroundColor: "#f4f7ff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10
  },

  btn: {
    backgroundColor: "#4a90ff",
    padding: 14,
    marginTop: 20,
    borderRadius: 10
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  },

  link: {
    marginTop: 15,
    color: "#4a90ff",
    textAlign: "center"
  }
});
