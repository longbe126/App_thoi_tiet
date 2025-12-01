import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clearSession } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoutScreen({ navigation }) {

  useFocusEffect(
    React.useCallback(() => {
      handleLogout();
    }, [])
  );

  const handleLogout = async () => {
    try {
      // 1. Xóa session phiên đăng nhập hiện tại
      await clearSession();
      
      // 2. Xóa Token (nếu có lưu riêng)
      await AsyncStorage.removeItem("token");

      // 3. (TÙY CHỌN MẠNH TAY) Xóa luôn dữ liệu rác nếu muốn reset hoàn toàn
      // await AsyncStorage.removeItem("history"); 
      // await AsyncStorage.removeItem("favorites");

      // 4. Chuyển về màn hình Đăng nhập
      // Dùng reset để không cho back lại
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      
    } catch (e) {
      console.log("Lỗi đăng xuất:", e);
      Alert.alert("Lỗi", "Không thể đăng xuất ngay lúc này.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10 }}>Đang đăng xuất...</Text>
    </View>
  );
}