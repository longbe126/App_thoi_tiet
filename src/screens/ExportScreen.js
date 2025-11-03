import React, { useState } from "react";
import { View, Text, Button, Alert, TextInput, StyleSheet, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { geocodeCity, fetchWeather } from "../services/weather";

export default function ExportScreen() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  // --- HÀM TẠO NỘI DUNG HTML (Giữ nguyên) ---
  const createHtmlReport = (city, weatherData) => {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const now = new Date();

    let dailyRows = "";
    daily.time.forEach((day, index) => {
      dailyRows += `
        <tr>
          <td>${new Date(day).toLocaleDateString('vi-VN')}</td>
          <td>${daily.temperature_2m_max[index].toFixed(0)}°C</td>
          <td>${daily.temperature_2m_min[index].toFixed(0)}°C</td>
          <td>${daily.precipitation_probability_max[index]}%</td>
        </tr>
      `;
    });


    return `
    <html><head><meta charset="UTF-8"><style>
          body { font-family: sans-serif; margin: 20px; } h1 { color: #3498db; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; }
          .current-info p { font-size: 16px; }
      </style></head>
      <body>
        <h1>Báo cáo thời tiết: ${city}</h1>
        <h2>Thời tiết hiện tại</h2>
        <div class="current-info">
          <p><strong>Nhiệt độ:</strong> ${current.temperature_2m.toFixed(0)}°C</p>
          <p><strong>Cảm giác như:</strong> ${current.apparent_temperature.toFixed(0)}°C</p>
        </div>
        <h2>Dự báo 7 ngày</h2>
        <table><thead><tr><th>Ngày</th><th>Cao</th><th>Thấp</th><th>Mưa</th></tr></thead>
        <tbody>${dailyRows}</tbody></table>
      </body>
    </html>
    `;
  };

  // --- HÀM LƯU FILE PDF VÀO THƯ MỤC DOWNLOADS ---
  const savePdfToDownloads = async () => {
    if (!city) {
      Alert.alert("Lỗi", "Vui lòng nhập tên thành phố");
      return;
    }
    setLoading(true);

    if (Platform.OS !== "android") {
      Alert.alert("Lỗi", "Tính năng này chỉ hỗ trợ trên Android.");
      setLoading(false);
      return;
    }

    try {
      // 1. Lấy dữ liệu thời tiết
      const locations = await geocodeCity(city);
      if (!locations || locations.length === 0) throw new Error(`Không tìm thấy thành phố "${city}"`);
      
      const location = locations[0];
      const weatherData = await fetchWeather({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      if (!weatherData) throw new Error("Không thể lấy dữ liệu thời tiết.");

      // 2. Tạo file PDF trong thư mục ẩn (cache)
      const htmlContent = createHtmlReport(city, weatherData);
      const { uri: tempFileUri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
 
      const token = await AsyncStorage.getItem("token");
      await fetch("http://10.0.2.2:3000/log-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ city_name: city })
      });

      // Yêu cầu người dùng chọn thư mục 
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert("Đã hủy", "Bạn đã từ chối cấp quyền lưu file.");
        setLoading(false);
        return;
      }
      const directoryUri = permissions.directoryUri;

      // Đọc file PDF tạm
      const pdfData = await FileSystem.readAsStringAsync(tempFileUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Tạo file mới trong thư mục người dùng đã chọn
      const fileName = `BaoCao_${city.replace(/ /g, '_')}_${Date.now()}.pdf`;
      const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, fileName, 'application/pdf');

      // Ghi dữ liệu vào file mới
      await FileSystem.writeAsStringAsync(newFileUri, pdfData, {
        encoding: FileSystem.EncodingType.Base64
      });
        
      Alert.alert("Thành công!", `Đã lưu file: ${fileName} vào thư mục bạn đã chọn.`);

    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Xuất dữ liệu</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Xuất báo cáo thời tiết (PDF)</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên thành phố (ví dụ: Hà Nội)"
          value={city}
          onChangeText={setCity}
        />
        <Button 
          title={loading ? "Đang xử lý..." : "Lưu vào điện thoại"} 
          onPress={savePdfToDownloads}
          disabled={loading}
        />
      </View>
    </View>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f7fa' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
});