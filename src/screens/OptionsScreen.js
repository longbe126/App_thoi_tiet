import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import thư viện vừa cài

// Component cho mỗi hàng tùy chọn (không đổi)
const OptionItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.optionButton} onPress={onPress}>
    <Feather name={icon} size={22} color="#555" />
    <Text style={styles.optionText}>{label}</Text>
    <Feather name="chevron-right" size={22} color="#ccc" />
  </TouchableOpacity>
);

export default function OptionsScreen({ navigation }) {
  const [username, setUsername] = useState('Người dùng');
  const [avatarUri, setAvatarUri] = useState(null); // State mới để lưu ảnh đại diện

  // Hàm này chạy khi màn hình được tải
  useEffect(() => {
    loadUserData();
  }, []);

  // Hàm tải thông tin user (username và avatar đã lưu)
  const loadUserData = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedAvatar = await AsyncStorage.getItem('avatar_url'); // Lấy avatar_url
    if (storedUsername) setUsername(storedUsername);
    if (storedAvatar) setAvatarUri(storedAvatar);
  };

  // Hàm chọn ảnh mới
  const pickImage = async () => {
    // Xin quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Từ chối!', 'Bạn cần cấp quyền truy cập thư viện ảnh để đổi avatar.');
      return;
    }

    // Mở thư viện ảnh
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Buộc ảnh phải là hình vuông
      quality: 0.5, // Giảm chất lượng ảnh để upload nhanh hơn
    });

    if (!result.canceled) {
      // Lấy ảnh đầu tiên
      const selectedImage = result.assets[0];
      // Gọi hàm upload
      await uploadAvatar(selectedImage.uri);
    }
  };

  // Hàm upload ảnh lên server
  const uploadAvatar = async (uri) => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    
    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('avatar', {
      uri: uri,
      name: `avatar_${userId}.jpg`,
      type: 'image/jpeg',
    });

    try {
      const res = await fetch("http://10.0.2.2:3000/upload-avatar", {
        method: "POST",
        headers: {
          'Authorization': 'Bearer ' + token,
          // Không cần 'Content-Type': 'multipart/form-data', FormData tự set
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi không xác định');
      }

      // Upload thành công
      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
      // Cập nhật ảnh trên giao diện
      setAvatarUri(data.avatar_url); 
      // Lưu lại link ảnh mới vào AsyncStorage
      await AsyncStorage.setItem('avatar_url', data.avatar_url);

    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi Upload", err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- Phần thông tin người dùng --- */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.avatar}>
            {avatarUri ? (
              // Nếu có avatar, hiển thị ảnh
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              // Nếu không, hiển thị chữ cái đầu
              <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
            )}
            <View style={styles.editIcon}>
              <Feather name="edit-2" size={14} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>{username}</Text>
      </View>

      {/* --- Phần danh sách tùy chọn --- */}
      <View style={styles.optionsList}>
        <OptionItem
          icon="alert-circle"
          label="Báo cáo sự cố"
          onPress={() => Alert.alert("Báo cáo", "Chức năng đang phát triển.")}
        />
        <OptionItem
          icon="download"
          label="Xuất dữ liệu thời tiết"
          onPress={() => navigation.navigate('Export')}
        />
        <OptionItem
          icon="log-out"
          label="Đăng xuất"
          onPress={() => navigation.navigate('Logout')}
        />
      </View>
    </View>
  );
}

// --- STYLESHEET (Đã cập nhật) ---
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 15,
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