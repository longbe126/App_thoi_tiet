import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { API_BASE } from '../config';

export default function ManageApiScreen() {
  const [apiConfigs, setApiConfigs] = useState([]);
  
  // State cho form thêm/sửa
  const [modalVisible, setModalVisible] = useState(false);
  const [provider, setProvider] = useState("Open-Meteo");
  const [apiKey, setApiKey] = useState("");
  const [activeId, setActiveId] = useState(null); // ID của API đang được dùng

  useEffect(() => {
    loadApiConfigs();
  }, []);

  // 1. Lấy danh sách cấu hình từ Server
  const loadApiConfigs = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/api-configs`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setApiConfigs(data);
      
      // Tìm cái nào đang active
      const active = data.find(item => item.is_active);
      if (active) setActiveId(active.id);
    } catch (e) {
      console.log("Lỗi load API:", e);
    }
  };

  // 2. Thêm cấu hình mới
  const handleSave = async () => {
    if (!provider) return Alert.alert("Lỗi", "Vui lòng nhập tên nhà cung cấp");

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/api-configs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ 
            provider: provider, 
            api_key: apiKey 
        })
      });

      if (res.ok) {
        Alert.alert("Thành công", "Đã thêm cấu hình API mới");
        setModalVisible(false);
        setProvider("Open-Meteo");
        setApiKey("");
        loadApiConfigs();
      } else {
        Alert.alert("Lỗi", "Không lưu được");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // 3. Kích hoạt API (Chuyển đổi API cho toàn hệ thống)
  const activateApi = async (id, providerName) => {
    Alert.alert("Xác nhận", `Bạn muốn chuyển sang dùng ${providerName}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await fetch(`${API_BASE}/admin/api-configs/${id}/activate`, {
              method: "PUT",
              headers: { Authorization: "Bearer " + token }
            });
            
            setActiveId(id);
            loadApiConfigs();
            Alert.alert("Đã chuyển đổi", `Hệ thống hiện đang dùng ${providerName}`);
          } catch (e) {
            Alert.alert("Lỗi", "Không thể kích hoạt");
          }
        }
      }
    ]);
  };

  // 4. Xóa cấu hình
  const deleteApi = async (id) => {
    if (id === activeId) return Alert.alert("Lỗi", "Không thể xóa API đang hoạt động!");

    Alert.alert("Xóa", "Xóa cấu hình này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");
          await fetch(`${API_BASE}/admin/api-configs/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
          });
          loadApiConfigs();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Nguồn Dữ Liệu</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Chọn API cung cấp thời tiết cho ứng dụng:</Text>

      <FlatList
        data={apiConfigs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isActive = item.id === activeId;
          return (
            <View style={[styles.card, isActive && styles.activeCard]}>
              <View style={styles.info}>
                <Text style={[styles.provider, isActive && styles.activeText]}>
                  {item.provider}
                </Text>
                <Text style={[styles.key, isActive && styles.activeText]}>
                  Key: {item.api_key ? "••••••••" + item.api_key.slice(-4) : "Không cần Key"}
                </Text>
              </View>

              <View style={styles.actions}>
                {isActive ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Đang dùng</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.activateBtn} 
                    onPress={() => activateApi(item.id, item.provider)}
                  >
                    <Text style={styles.activateText}>Kích hoạt</Text>
                  </TouchableOpacity>
                )}

                {!isActive && (
                  <TouchableOpacity onPress={() => deleteApi(item.id)} style={styles.delBtn}>
                    <Feather name="trash-2" size={20} color="#ff4d4d" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Modal Thêm Mới */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm API Mới</Text>
            
            <Text style={styles.label}>Nhà cung cấp (Provider):</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ví dụ: WeatherAPI, OpenWeather..." 
              value={provider}
              onChangeText={setProvider}
            />

            <Text style={styles.label}>API Key (Nếu có):</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập API Key..." 
              value={apiKey}
              onChangeText={setApiKey}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{color: '#666'}}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  
  addBtn: { backgroundColor: "#007bff", width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  card: {
    backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  activeCard: { backgroundColor: "#007bff", borderColor: "#0056b3", borderWidth: 1 },
  
  info: { flex: 1 },
  provider: { fontSize: 18, fontWeight: "bold", color: "#333" },
  key: { fontSize: 14, color: "#888", marginTop: 4 },
  activeText: { color: "white" },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  
  activateBtn: { backgroundColor: "#e9ecef", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  activateText: { color: "#333", fontWeight: "600", fontSize: 12 },
  
  badge: { backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  badgeText: { color: "white", fontWeight: "bold", fontSize: 12 },

  delBtn: { padding: 5 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontWeight: '600', marginBottom: 5, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  cancelBtn: { padding: 12 },
  saveBtn: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
});