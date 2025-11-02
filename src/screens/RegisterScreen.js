import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
    if (!username || !email || !phone || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ Username, Email, SĐT và Password");
      return;
    }

    try {
      const res = await fetch("http://10.0.2.2:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Đăng ký thất bại", data.error || "Có lỗi xảy ra");
        return;
      }

      Alert.alert("Thành công", "Đăng ký thành công!");
      navigation.replace("Login");
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không kết nối được tới server");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.form}>
        <Text style={styles.title}>🌤 Breezy Weather</Text>
        <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

        <TextInput
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={onRegister}>
          <Text style={styles.buttonText}>ĐĂNG KÝ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    padding: 20,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#4facfe",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#4facfe",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkButton: {
    alignItems: "center",
    marginTop: 5,
  },
  linkText: {
    color: "#4facfe",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
