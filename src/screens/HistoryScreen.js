import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const h = JSON.parse(await AsyncStorage.getItem("history") || "[]");
    setHistory(h);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Lịch sử tìm kiếm</Text>

      <FlatList
        data={history}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ paddingVertical: 12, borderBottomWidth: 1 }}
            onPress={() => navigation.navigate("Weather", { cityName: item })}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
