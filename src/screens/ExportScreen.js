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

  // ========================= LẤY THÔNG TIN USER =========================
  const loadUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch("http://10.0.2.2:3000/api/user/profile", {
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

  
  const getDaysRegistered = (created_at) => {
    const createDate = new Date(created_at);
    const now = new Date();

    const diffMs = now - createDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
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
  const createPDF_HTML = (user, days, weather) => {
    const dailyRows = weather.daily.time
      .map(
        (d, i) => `
      <tr>
        <td>${new Date(d).toLocaleDateString("vi-VN")}</td>
        <td>${weather.daily.temperature_2m_max[i]}°C</td>
        <td>${weather.daily.temperature_2m_min[i]}°C</td>
        <td>${weather.daily.precipitation_probability_max[i]}%</td>
      </tr>`
      )
      .join("");

    return `
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { text-align: center; }
          .box { border:1px solid #ccc; padding:12px; border-radius:8px; margin-top:15px; }
          .label { font-weight:bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #aaa; text-align:center; padding: 6px; }
          th { background:#eee; }
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
          <p><span class="label">Ngày tạo tài khoản:</span> 
            ${new Date(user.created_at).toLocaleDateString("vi-VN")}
          </p>
          <p><span class="label">Số ngày đã sử dụng:</span> ${days} ngày</p>
        </div>

        <div class="box">
          <h3>2. Thời tiết hiện tại</h3>
          <p>Nhiệt độ: ${weather.current.temperature_2m}°C</p>
          <p>Cảm giác như: ${weather.current.apparent_temperature}°C</p>
          <p>Gió: ${weather.current.wind_speed_10m} km/h</p>
        </div>

        <div class="box">
          <h3>3. Dự báo 7 ngày</h3>
          <table>
            <tr>
              <th>Ngày</th>
              <th>Cao nhất</th>
              <th>Thấp nhất</th>
              <th>Mưa (%)</th>
            </tr>
            ${dailyRows}
          </table>
        </div>

      </body>
      </html>
    `;
  };

  // ========================= XUẤT PDF =========================
  const exportPDF = async () => {
    if (!userInfo) return;

    setLoading(true);

    try {
      const days = getDaysRegistered(userInfo.created_at);

      const weather = await getWeatherReport();

      const html = createPDF_HTML(userInfo, days, weather);

      const { uri } = await Print.printToFileAsync({ html });

      // Ghi log
      const token = await AsyncStorage.getItem("token");
      await fetch("http://10.0.2.2:3000/log-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          details: `Xuất PDF lúc ${new Date().toLocaleString("vi-VN")}`
        })
      });

      Alert.alert("Xuất file", "Chọn nơi lưu",
        [
          { text: "📁 Lưu vào thư mục", onPress: () => saveToDevice(uri) },
          { text: "📤 Chia sẻ", onPress: () => shareViaApp(uri) },
          { text: "Hủy", style: "cancel" }
        ]
      );

    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể xuất PDF");
    }

    setLoading(false);
  };

  // ========================= LƯU FILE =========================
  const saveToDevice = async (fileUri) => {
    try {
      const permission = await FileSystem.StorageAccessFramework
        .requestDirectoryPermissionsAsync();

      if (!permission.granted) return;

      const pdfBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const fileName = `BaoCao_${Date.now()}.pdf`;

      const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permission.directoryUri, fileName, "application/pdf"
      );

      await FileSystem.writeAsStringAsync(newUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64
      });

      Alert.alert("✅ Thành công", "File đã lưu");
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể lưu file");
    }
  };

  // ========================= SHARE =========================
  const shareViaApp = async (fileUri) => {
    try {
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể chia sẻ");
    }
  };

  // ========================= UI =========================
  if (loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải thông tin...</Text>
      </View>
    );
  }

  const days = getDaysRegistered(userInfo.created_at);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Xuất dữ liệu (PDF)</Text>

      <View style={styles.box}>
        <Text style={styles.label}>Họ tên:</Text>
        <Text>{userInfo.fullname}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text>{userInfo.email}</Text>

        <Text style={styles.label}>Điện thoại:</Text>
        <Text>{userInfo.phone}</Text>

        <Text style={styles.label}>Đã đăng ký được:</Text>
        <Text>{days} ngày</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={exportPDF}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Đang xuất..." : "Xuất PDF"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },
  box: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 1
  },
  label: { marginTop: 10, fontWeight: "bold" },
  btn: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center"
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
