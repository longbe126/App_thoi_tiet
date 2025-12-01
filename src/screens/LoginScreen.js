import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from '../config';

// --- QUAN TRỌNG: Import hàm setSession và saveUser ---
import { setSession, saveUser } from "../utils/storage";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ");
    }

    setLoading(true); // Bắt đầu xoay

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");

      // 1. Lưu Token (để gọi API sau này)
      await AsyncStorage.setItem("token", data.token);

      // 2. --- KHÚC QUAN TRỌNG NHẤT ĐỂ SỬA LỖI DỮ LIỆU LẪN LỘN ---
      // Thiết lập phiên làm việc riêng cho user này
      await setSession(username);
      
      // 3. Lưu thông tin user (bao gồm link ảnh đại diện mới nhất)
      // Lưu fullname và avatar nếu server trả
      if (data.fullname) {
        await AsyncStorage.setItem('fullname', data.fullname);
      }
      if (data.avatar_url) {
        await AsyncStorage.setItem('avatar_url', data.avatar_url);
      }

      await saveUser({
          username: username,
          role: data.role,
          userId: data.userId,
          fullname: data.fullname || null,
          avatar_url: data.avatar_url || null // Link ảnh từ server trả về
      });

      Alert.alert("Thành công", "Đăng nhập thành công!");

      // 4. Chuyển hướng
      navigation.replace("Main", { role: data.role });

    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể kết nối server");
    } finally {
      setLoading(false); // Tắt xoay
    }
  };

  return (
    <View style={styles.container}>
      
      <Image
        source={require("../../assets/logoDAU.jpg")}
        style={styles.logo}
      />

      <Text style={styles.brand}>🌙 Long Night</Text>
      <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
            style={[styles.btn, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
        >
          {loading ? (
              <ActivityIndicator color="white" />
          ) : (
              <Text style={styles.btnText}>ĐĂNG NHẬP</Text>
          )}
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
    borderRadius: 10,
    alignItems: 'center' // Căn giữa vòng xoay loading
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