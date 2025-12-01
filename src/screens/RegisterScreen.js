import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from '../config';
import { saveUser } from "../utils/storage";

export default function RegisterScreen({ navigation }) {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false); // Thêm state loading

  // PICK ẢNH
  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return Alert.alert("Lỗi", "Bạn phải cấp quyền truy cập ảnh.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7, // Giảm quality xuống 0.7 để upload nhanh hơn
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // ĐĂNG KÝ
  const register = async () => {
    if (!fullname || !username || !email || !phone || !password) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
    }

    setLoading(true);

    try {
      // 1. Tạo tài khoản (Text Info)
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, username, email, phone, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");

      const token = data.token; 

      // Lưu Token để dùng sau này
      await AsyncStorage.setItem("token", token);
      // Lưu tạm fullname cho màn Options (sẽ được ghi đè khi login)
      await AsyncStorage.setItem('fullname', fullname);
      await saveUser({ username, role: "user", fullname });

      // 2. Upload avatar (Nếu có chọn ảnh)
      if (avatar) {
        const formData = new FormData();
        
        // Cấu trúc file đúng chuẩn React Native
        const fileData = {
            uri: avatar,
            type: 'image/jpeg', // Luôn để image/jpeg hoặc lấy từ result picker
            name: `avatar_${username}.jpg`, 
        };

        formData.append("avatar", fileData);

        // Gọi API Upload
        const uploadRes = await fetch(`${API_BASE}/upload-avatar`, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token,
            // QUAN TRỌNG: Không set 'Content-Type': 'multipart/form-data' thủ công
            // Hãy để fetch tự động set boundary
          },
          body: formData
        });
        
        if (!uploadRes.ok) console.log("Lỗi upload ảnh:", await uploadRes.text());
        else {
          try {
            const uploadData = await uploadRes.json();
            if (uploadData && uploadData.avatar_url) {
              // Lưu avatar tạm vào AsyncStorage để OptionsScreen có thể dùng
              await AsyncStorage.setItem('avatar_url', uploadData.avatar_url);
              // Cập nhật saved user record
              await saveUser({ username, role: 'user', fullname, avatar_url: uploadData.avatar_url });
            }
          } catch (e) {
            console.log('Upload parse error:', e);
          }
        }
      }

      Alert.alert("Thành công", "Đăng ký thành công!", [
          { text: "OK", onPress: () => navigation.replace("Login") } // Chuyển về Login cho chắc
      ]);

    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể kết nối server");
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>

        {/* LOGO */}
        <Image
            source={require("../../assets/logoDAU.jpg")}
            style={styles.logo}
        />

        {/* THƯƠNG HIỆU */}
        <Text style={styles.brand}>🌙 Long Night</Text>
        <Text style={styles.subtitle}>Tạo tài khoản để tiếp tục</Text>

        {/* CHỌN AVATAR */}
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarBox}>
            {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
            <Text style={{ color: "#777" }}>Chọn ảnh</Text>
            )}
        </TouchableOpacity>

        {/* FORM */}
        <View style={styles.card}>
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
            keyboardType="email-address"
            />

            <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            />

            <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            />

            <TouchableOpacity 
                style={[styles.btn, loading && { opacity: 0.7 }]} 
                onPress={register}
                disabled={loading}
            >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.btnText}>ĐĂNG KÝ</Text>
            )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
        </View>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    paddingTop: 40, 
    paddingBottom: 40,
    backgroundColor: "#eef5ff" 
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 8
  },

  brand: {
    fontSize: 24,
    color: "#3D79FF",
    fontWeight: "bold",
    marginBottom: 4
  },

  subtitle: { 
    color: "#555", 
    marginBottom: 20 
  },

  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: "#aaa",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden"
  },

  avatar: {
    width: 100,
    height: 100,
  },

  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  input: {
    backgroundColor: "#f4f7ff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },

  btn: {
    backgroundColor: "#4a90ff",
    padding: 16,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center'
  },

  btnText: { 
    color: "#fff", 
    textAlign: "center", 
    fontWeight: "bold",
    fontSize: 16
  },

  link: { 
    marginTop: 15, 
    color: "#4a90ff", 
    textAlign: "center",
    fontWeight: "500"
  }
});