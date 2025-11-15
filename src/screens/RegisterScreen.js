import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from "react-native";

import * as ImagePicker from "expo-image-picker";

export default function RegisterScreen({ navigation }) {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState(null);

  // PICK ẢNH
  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return Alert.alert("Lỗi", "Bạn phải cấp quyền truy cập ảnh.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
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

    try {
      // 1. Tạo tài khoản
      const res = await fetch("http://10.0.2.2:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, username, email, phone, password })
      });

      const data = await res.json();
      if (!res.ok) return Alert.alert("Lỗi", data.error);

      const token = data.token; 

      // 2. Upload avatar
      if (avatar) {
        const form = new FormData();
        form.append("avatar", {
          uri: avatar,
          name: "avatar.jpg",
          type: "image/jpeg"
        });

        await fetch("http://10.0.2.2:3000/upload-avatar", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "multipart/form-data"
          },
          body: form
        });
      }

      Alert.alert("Thành công", "Đăng ký thành công!");
      navigation.goBack();

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

      {/* THƯƠNG HIỆU */}
      <Text style={styles.brand}>🌙 Long Night</Text>
      <Text style={styles.subtitle}>Tạo tài khoản để tiếp tục</Text>

      {/* CHỌN AVATAR */}
      <TouchableOpacity onPress={pickAvatar} style={styles.avatarBox}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Text style={{ color: "#777" }}>Chọn ảnh đại diện</Text>
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
        />

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={register}>
          <Text style={styles.btnText}>ĐĂNG KÝ</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    paddingTop: 60, 
    backgroundColor: "#eef5ff" 
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 8
  },

  brand: {
    fontSize: 26,
    color: "#3D79FF",
    fontWeight: "bold",
    marginBottom: 4
  },

  subtitle: { 
    color: "#555", 
    marginBottom: 20 
  },

  avatarBox: {
    width: 110,
    height: 110,
    borderRadius: 100,
    borderColor: "#aaa",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 100
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
