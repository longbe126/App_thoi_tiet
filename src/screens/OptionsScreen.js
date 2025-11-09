import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // thư viện tải ảnh 

const OptionItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.optionButton} onPress={onPress}>
    <Feather name={icon} size={22} color="#555" />
    <Text style={styles.optionText}>{label}</Text>
    <Feather name="chevron-right" size={22} color="#ccc" />
  </TouchableOpacity>
);

export default function OptionsScreen({ navigation }) {
  const [username, setUsername] = useState('Người dùng');
  const [avatarUri, setAvatarUri] = useState(null); 

 
  useEffect(() => {
    loadUserData();
  }, []);

 
  const loadUserData = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedAvatar = await AsyncStorage.getItem('avatar_url'); 
    if (storedUsername) setUsername(storedUsername);
    if (storedAvatar) setAvatarUri(storedAvatar);
  };

 
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Từ chối!', 'Bạn cần cấp quyền truy cập thư viện ảnh để đổi avatar.');
      return;
    }


    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.5, 
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
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
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi không xác định');
      }

      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
      setAvatarUri(data.avatar_url); 
      await AsyncStorage.setItem('avatar_url', data.avatar_url);

    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi Upload", err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- thông tin người dùng --- */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.avatar}>
            {avatarUri ? (            
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
            )}
            <View style={styles.editIcon}>
              <Feather name="edit-2" size={14} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>{username}</Text>
      </View>

      {/* --- danh sách tùy chọn --- */}
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