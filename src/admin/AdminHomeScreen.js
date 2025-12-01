import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearSession } from "../utils/storage";
import { API_BASE } from '../config';

export default function AdminHomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  // ======================= LOAD DASHBOARD =======================
  const loadStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token");
        return;
      }

      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: "Bearer " + token }
      });

      const text = await res.text();

      // ❌ Nếu backend trả về HTML => API lỗi
      if (text.startsWith("<")) {
        console.log("❌ Server trả về HTML (API lỗi):", text);
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);
      setStats(data);

    } catch (err) {
      console.log("❌ Lỗi khi load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======================= LOADING UI =======================
  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 16 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Nếu không có stats (API lỗi)
  if (!stats) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 16, color: "red" }}>Không tải được dữ liệu Admin</Text>
      </View>
    );
  }

  // ======================= MAIN UI =======================
  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Trang quản trị</Text>

      {/* USER CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Người dùng</Text>
        <Text style={styles.cardValue}>Tổng: {stats.total_users}</Text>
        <Text style={styles.cardSub}>Admin: {stats.total_admin}</Text>
        <Text style={styles.cardSub}>
          User: {stats.total_users - stats.total_admin}
        </Text>
      </View>

      {/* HISTORY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hoạt động</Text>
        <Text style={styles.cardValue}>Tìm kiếm: {stats.total_history}</Text>
      </View>

      {/* FILE & EXPORT */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>File & Export</Text>
        <Text style={styles.cardSub}>User upload: {stats.total_files}</Text>
        <Text style={styles.cardSub}>Export file: {stats.total_exports}</Text>
      </View>

      {/* API KEY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>API Key</Text>
        <Text style={styles.cardValue}>{stats.total_api} API Key</Text>
      </View>

      {/* MENU */}
      <Text style={styles.section}>Chức năng</Text>

      {renderButton("👤   Quản lý tài khoản", () => navigation.navigate("ManageAccounts"))}
      {renderButton("🔑   Quản lý API Key", () => navigation.navigate("ManageApi"))}

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          // Clear only admin session and token, don't wipe app storage
          try {
            await clearSession();
            await AsyncStorage.removeItem('token');
          } catch (e) {
            console.log('Error clearing admin session:', e);
          }
          navigation.replace("Login");
        }}
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* COMPONENT RENDER BUTTON */
function renderButton(label, onPress) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#f9f9f9" },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  cardValue: { fontSize: 16, fontWeight: "600" },
  cardSub: { fontSize: 14, color: "#666" },

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold"
  },

  menuBtn: {
    backgroundColor: "#e9ecff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1
  },
  menuText: { fontSize: 16, fontWeight: "500" },

  logoutBtn: {
    backgroundColor: "#ff4d4d",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold"
  }
});
