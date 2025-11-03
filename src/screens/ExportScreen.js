import React, { useState } from "react";
import { View, Text, Button, Alert, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Import các hàm dịch vụ từ file weather.js
import { geocodeCity, fetchWeather } from "../services/weather";

export default function ExportScreen() {
  const [exportedFileUri, setExportedFileUri] = useState(null);
  const [city, setCity] = useState(""); // State để lưu tên thành phố
  const [loading, setLoading] = useState(false);

  // --- HÀM XUẤT DỮ LIỆU THỜI TIẾT (MỚI) ---
  const exportWeatherData = async () => {
    if (!city) {
      Alert.alert("Lỗi", "Vui lòng nhập tên thành phố");
      return;
    }
    setLoading(true);
    setExportedFileUri(null);

    try {
      // 1. Tìm tọa độ của thành phố
      const locations = await geocodeCity(city);
      if (!locations || locations.length === 0) {
        Alert.alert("Không tìm thấy", `Không tìm thấy thành phố "${city}"`);
        setLoading(false);
        return;
      }
      const location = locations[0];

      // 2. Lấy dữ liệu thời tiết
      const weatherData = await fetchWeather({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (!weatherData) {
        Alert.alert("Lỗi", "Không thể lấy dữ liệu thời tiết.");
        setLoading(false);
        return;
      }

      // 3. Ghi ra file
      const fileUri = FileSystem.documentDirectory + `${city}_weather.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(weatherData, null, 2));
      
      setExportedFileUri(fileUri); // Lưu lại đường dẫn file đã xuất
      setLoading(false);
      Alert.alert("Thành công", `Đã xuất file JSON cho ${city}`);

    } catch (err) {
      console.error(err);
      setLoading(false);
      Alert.alert("Lỗi", "Có lỗi xảy ra trong quá trình xuất file.");
    }
  };

  // --- HÀM XUẤT FAVORITES (GIỮ NGUYÊN) ---
  const exportFavoritesData = async () => {
    setLoading(true);
    setExportedFileUri(null);
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch("http://10.0.2.2:3000/favorites", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      const fileUri = FileSystem.documentDirectory + "favorites.json";
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      
      setExportedFileUri(fileUri);
      setLoading(false);
      Alert.alert("Thành công", "Đã xuất file JSON (Yêu thích)");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // --- HÀM CHIA SẺ FILE (DÙNG CHUNG) ---
  const shareFile = async () => {
    if (exportedFileUri) {
      await Sharing.shareAsync(exportedFileUri);
    } else {
      Alert.alert("Lỗi", "Chưa có file nào để chia sẻ.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Xuất dữ liệu</Text>

      {/* Phần xuất thời tiết */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Xuất dữ liệu thời tiết</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên thành phố (ví dụ: Hà Nội)"
          value={city}
          onChangeText={setCity}
        />
        <Button 
          title={loading ? "Đang xử lý..." : "Xuất file thời tiết"} 
          onPress={exportWeatherData} 
          disabled={loading}
        />
      </View>

    

      {/* Nút chia sẻ chung */}
      {exportedFileUri && (
        <View style={styles.shareCard}>
          <Text style={styles.shareText}>Đã xuất file! Bạn có muốn chia sẻ?</Text>
          <Button title="Chia sẻ file" onPress={shareFile} color="#27ae60" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  shareCard: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#e8f8f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#27ae60',
  }
});