import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    fetchHistory(t);
  };

  const fetchHistory = async (t) => {
    try {
      const res = await fetch("http://10.0.2.2:3000/history", {
        headers: { Authorization: "Bearer " + t },
      });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch("http://10.0.2.2:3000/history", {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      Alert.alert("Thông báo", "Đã xoá lịch sử");
      fetchHistory(token);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Lịch sử</Text>
      <Button title="Xoá toàn bộ" onPress={clearHistory} />
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 5 }}>
            <Text>{item.type} - {item.query || item.city_name}</Text>
          </View>
        )}
      />
    </View>
  );
}
