import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

// Component cho mỗi hàng tùy chọn để tránh lặp code
const OptionItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.optionButton} onPress={onPress}>
    <Feather name={icon} size={22} color="#555" />
    <Text style={styles.optionText}>{label}</Text>
    <Feather name="chevron-right" size={22} color="#ccc" />
  </TouchableOpacity>
);

export default function OptionsScreen({ navigation }) {
  const [username, setUsername] = useState('Người dùng');

  // Lấy username từ AsyncStorage khi màn hình được tải
  useEffect(() => {
    const fetchUsername = async () => {
      // Bạn cần lưu username khi đăng nhập để nó hiển thị ở đây
      const storedUsername = await AsyncStorage.getItem('username'); 
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };
    fetchUsername();
  }, []);

  const handleReportIssue = () => {
    Alert.alert(
      "Báo cáo sự cố",
      "Chức năng này đang được phát triển."
    );
  };

  return (
    <View style={styles.container}>
      {/* --- Phần thông tin người dùng --- */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{username}</Text>
      </View>

      {/* --- Phần danh sách tùy chọn --- */}
      <View style={styles.optionsList}>
        <OptionItem
          icon="alert-circle"
          label="Báo cáo sự cố"
          onPress={handleReportIssue}
        />
        <OptionItem
          icon="download"
          label="Xuất dữ liệu thời tiết"
          // Điều hướng đến màn hình Export đã có sẵn
          onPress={() => navigation.navigate('Export')}
        />
        <OptionItem
          icon="log-out"
          label="Đăng xuất"
          // Điều hướng đến màn hình Logout đã có sẵn
          onPress={() => navigation.navigate('Logout')} 
        />
      </View>
    </View>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsList: {
    marginTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});