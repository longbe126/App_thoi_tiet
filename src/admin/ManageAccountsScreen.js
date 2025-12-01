import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from '../config';

export default function ManageAccountsScreen({ navigation }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setUsers(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý tài khoản</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("UserDetail", { user: item })}
          >
            <Text style={styles.name}>{item.fullname}</Text>
            <Text style={styles.role}>{item.role.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  item: {
    padding: 15,
    backgroundColor: "#eef3ff",
    marginBottom: 10,
    borderRadius: 10,
  },
  name: { fontSize: 16, fontWeight: "600" },
  role: { fontSize: 14, color: "#444" },
});
