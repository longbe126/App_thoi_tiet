import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ManageApiScreen() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch("http://10.0.2.2:3000/admin/api-keys", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    setApiKeys(data);
  };

  const createKey = async () => {
    if (!newKey.trim()) return;

    const token = await AsyncStorage.getItem("token");

    const res = await fetch("http://10.0.2.2:3000/admin/api-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ key_value: newKey })
    });

    if (!res.ok) return Alert.alert("Lỗi", "Không tạo được API Key");

    setNewKey("");
    loadApiKeys();
  };

  const deleteKey = async (id) => {
    Alert.alert("Xác nhận", "Xóa API Key này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");
          await fetch(`http://10.0.2.2:3000/admin/api-keys/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
          });
          loadApiKeys();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý API Key</Text>

      {/* Tạo mới */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Nhập API Key mới"
          value={newKey}
          onChangeText={setNewKey}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addBtn} onPress={createKey}>
          <Text style={styles.addText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách */}
      <FlatList
        data={apiKeys}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.key}>{item.key_value}</Text>
              <Text style={styles.status}>
                Trạng thái: {item.active ? "Hoạt động" : "Tắt"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteKey(item.id)}
            >
              <Text style={styles.deleteText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  inputBox: { flexDirection: "row", marginBottom: 15 },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8
  },
  addBtn: {
    backgroundColor: "#4a90ff",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 8,
    marginLeft: 10
  },
  addText: { color: "#fff", fontWeight: "bold" },
  item: {
    padding: 15,
    backgroundColor: "#eef3ff",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  key: { fontSize: 16, fontWeight: "600" },
  status: { fontSize: 14, color: "#666" },
  deleteBtn: {
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 8
  },
  deleteText: { color: "#fff", fontWeight: "bold" }
});
