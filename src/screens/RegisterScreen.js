import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null); // ảnh đại diện chọn từ thư viện

  // chọn ảnh y như OptionsScreen
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // upload ảnh sau khi đã đăng ký + có token
  const uploadAvatar = async (token) => {
    if (!avatar) return;

    const formData = new FormData();
    formData.append("avatar", {
      uri: avatar,
      name: "avatar.jpg",
      type: "image/jpeg",
    });

    try {
      await fetch("http://10.0.2.2:3000/upload-avatar", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          // ❌ KHÔNG ĐƯỢC tự đặt Content-Type
        },
        body: formData,
      });
    } catch (err) {
      console.log("Upload avatar error:", err);
    }
  };

  // xử lý đăng ký
  const handleRegister = async () => {
    if (!username || !fullname || !email || !phone || !password) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
    }

    try {
      const res = await fetch("http://10.0.2.2:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          fullname,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert("Lỗi", data.error || "Đăng ký thất bại");
      }

      // Lưu token để upload avatar
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("role", data.role);
      await AsyncStorage.setItem("userId", data.userId.toString());

      // upload avatar
      await uploadAvatar(data.token);

      Alert.alert("Thành công", "Đăng ký thành công!");
      navigation.replace("Login");

    } catch (err) {
      console.log("REG ERROR:", err);
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={fullname}
        onChangeText={setFullname}
      />

      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      {avatar && <Image source={{ uri: avatar }} style={styles.avatarPreview} />}

      <TouchableOpacity style={styles.avatarBtn} onPress={pickAvatar}>
        <Text style={{ color: "#fff" }}>Chọn ảnh đại diện</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.registerText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginVertical: 10,
  },
  avatarBtn: {
    backgroundColor: "#4fa0ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  registerBtn: {
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  registerText: { color: "#fff", fontSize: 16 },
  loginLink: {
    textAlign: "center",
    marginTop: 16,
    color: "#555",
    textDecorationLine: "underline",
  },
});
