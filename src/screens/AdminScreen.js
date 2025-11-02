import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    fetchUsers(t);
  };

  const fetchUsers = async (t) => {
    try {
      const res = await fetch("http://10.0.2.2:3000/admin/users", {
        headers: { Authorization: "Bearer " + t },
      });
      if (!res.ok) {
        Alert.alert("Lỗi", "Không có quyền Admin");
        return;
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Quản trị</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 5 }}>
            <Text>{item.username} - {item.role}</Text>
          </View>
        )}
      />
    </View>
  );
}
