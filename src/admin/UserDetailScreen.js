import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserDetailScreen({ route, navigation }) {
  const { user } = route.params;
  const [role, setRole] = useState(user.role);

  const updateRole = async (newRole) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`http://10.0.2.2:3000/admin/user/${user.id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ role: newRole }),
    });

    Alert.alert("Thành công", "Cập nhật quyền thành công!");
    setRole(newRole);
  };

  const deleteUser = async () => {
    Alert.alert("Xác nhận", "Xóa user này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");

          await fetch(`http://10.0.2.2:3000/admin/user/${user.id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
          });

          Alert.alert("Đã xóa!");
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết người dùng</Text>

      <Text style={styles.info}>Tên: {user.fullname}</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Text style={styles.info}>Role hiện tại: {role}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => updateRole(role === "admin" ? "user" : "admin")}
      >
        <Text style={styles.btnText}>
          Chuyển thành {role === "admin" ? "USER" : "ADMIN"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={deleteUser}>
        <Text style={styles.deleteText}>XÓA TÀI KHOẢN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  info: { fontSize: 16, marginBottom: 10 },
  btn: {
    backgroundColor: "#4a90ff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  btnText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  deleteBtn: {
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  deleteText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
});
