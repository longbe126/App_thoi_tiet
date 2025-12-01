import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from '../config';
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { geocodeCity, fetchWeather } from "../services/weather";

export default function ExportScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserInfo(data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lấy thông tin người dùng");
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- SỬA LẠI: Định dạng ngày giờ dễ nhìn hơn ---
  const formatDateFull = (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    
    // Ví dụ: 14:30:05 - 01/12/2025
    return `${hh}:${min}:${ss} - ${dd}/${mm}/${yyyy}`;
  };

  // --- SỬA LẠI: Dùng dấu phẩy ngăn cách cho dễ đọc ---
  const getDetailedDuration = (startDateStr) => {
    const start = new Date(startDateStr);
    const end = new Date();

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    let hours = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();
    let seconds = end.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }

    // Ví dụ: 1 năm, 2 tháng, 5 ngày...
    return `${years} năm, ${months} tháng, ${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây`;
  };

  const getWeatherReport = async () => {
    const geo = await geocodeCity("Hà Nội");
    const loc = geo[0];
    return await fetchWeather({
      latitude: loc.latitude,
      longitude: loc.longitude
    });
  };

  // ========================= HTML PDF =========================
  const createPDF_HTML = (user, weather) => {
    const dailyRows = weather.daily.time
      .map((d, i) => `
      <tr>
        <td>${new Date(d).toLocaleDateString("vi-VN")}</td>
        <td>${weather.daily.temperature_2m_max[i]}°C</td>
        <td>${weather.daily.temperature_2m_min[i]}°C</td>
        <td>${weather.daily.precipitation_probability_max[i]}%</td>
      </tr>`
      ).join("");

    return `
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          h2 { text-align: center; color: #333; }
          .box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-top: 20px; background-color: #f9f9f9; }
          h3 { margin-top: 0; color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .label { font-weight: bold; color: #555; }
          p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; text-align: center; padding: 8px; }
          th { background-color: #e9ecef; }
        </style>
      </head>
      <body>
        <h2>Báo cáo người dùng & thời tiết</h2>

        <div class="box">
          <h3>1. Thông tin tài khoản</h3>
          <p><span class="label">Họ tên:</span> ${user.fullname}</p>
          <p><span class="label">Email:</span> ${user.email}</p>
          <p><span class="label">Điện thoại:</span> ${user.phone}</p>
          <p><span class="label">Vai trò:</span> ${user.role}</p>
          <p><span class="label">Ngày tạo:</span> ${formatDateFull(user.created_at)}</p>
          <p><span class="label">Thời gian sử dụng:</span> ${getDetailedDuration(user.created_at)}</p>
        </div>

        <div class="box">
          <h3>2. Thời tiết hiện tại</h3>
          <p><span class="label">Nhiệt độ:</span> ${weather.current.temperature_2m}°C</p>
          <p><span class="label">Cảm giác như:</span> ${weather.current.apparent_temperature}°C</p>
          <p><span class="label">Gió:</span> ${weather.current.wind_speed_10m} km/h</p>
        </div>

        <div class="box">
          <h3>3. Dự báo 7 ngày tới</h3>
          <table>
            <tr>
              <th>Ngày</th>
              <th>Max</th>
              <th>Min</th>
              <th>Mưa (%)</th>
            </tr>
            ${dailyRows}
          </table>
        </div>
      </body>
      </html>
    `;
  };

  const exportPDF = async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const weather = await getWeatherReport();
      const html = createPDF_HTML(userInfo, weather);
      const { uri } = await Print.printToFileAsync({ html });

      // Ghi log (nếu cần)
      try {
        const token = await AsyncStorage.getItem("token");
        await fetch(`${API_BASE}/log-export`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
            },
            body: JSON.stringify({
            details: `Xuất PDF lúc ${new Date().toLocaleString("vi-VN")}`
            })
        });
      } catch (e) { console.log("Log error:", e); }

      Alert.alert("Xuất file thành công", "Chọn hành động:",
        [
          { text: "Lưu vào máy", onPress: () => saveToDevice(uri) },
          { text: "Chia sẻ", onPress: () => shareViaApp(uri) },
          { text: "Đóng", style: "cancel" }
        ]
      );
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể xuất PDF");
    }
    setLoading(false);
  };

  const saveToDevice = async (fileUri) => {
    try {
      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permission.granted) return;

      const pdfBase64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      const fileName = `BaoCao_${Date.now()}.pdf`;
      const newUri = await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, fileName, "application/pdf");
      await FileSystem.writeAsStringAsync(newUri, pdfBase64, { encoding: FileSystem.EncodingType.Base64 });

      Alert.alert("Thành công", "Đã lưu file vào máy!");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lưu file");
    }
  };

  const shareViaApp = async (fileUri) => {
    try {
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể chia sẻ");
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{marginTop: 10}}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Xuất Báo Cáo</Text>

      <View style={styles.box}>
        <View style={styles.row}>
            <Text style={styles.label}>Họ tên:</Text>
            <Text style={styles.value}>{userInfo.fullname}</Text>
        </View>
        
        <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userInfo.email}</Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>SĐT:</Text>
            <Text style={styles.value}>{userInfo.phone}</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.label}>Ngày tạo tài khoản:</Text>
        <Text style={styles.valueHighlight}>{formatDateFull(userInfo.created_at)}</Text>

        <Text style={[styles.label, {marginTop: 10}]}>Thời gian đã sử dụng:</Text>
        <Text style={styles.valueHighlight}>{getDetailedDuration(userInfo.created_at)}</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={exportPDF}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.btnText}>XUẤT FILE PDF</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333"
  },
  box: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  label: { fontSize: 15, color: "#666", fontWeight: "600" },
  value: { fontSize: 15, color: "#333", fontWeight: "bold" },
  valueHighlight: { fontSize: 16, color: "#007bff", fontWeight: "bold", marginTop: 2 },
  separator: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  btn: {
    backgroundColor: "#007bff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 1 }
});