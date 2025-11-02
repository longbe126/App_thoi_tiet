import React, { useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function ExportScreen() {
  const [exported, setExported] = useState(null);

  const exportData = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch("http://10.0.2.2:3000/favorites", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      const fileUri = FileSystem.documentDirectory + "favorites.json";
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      setExported(fileUri);
      Alert.alert("Thành công", "Đã xuất file JSON");
    } catch (err) {
      console.error(err);
    }
  };

  const shareFile = async () => {
    if (exported) {
      await Sharing.shareAsync(exported);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Xuất dữ liệu</Text>
      <Button title="Xuất JSON (Favorites)" onPress={exportData} />
      {exported && <Button title="Chia sẻ file" onPress={shareFile} />}
    </View>
  );
}
