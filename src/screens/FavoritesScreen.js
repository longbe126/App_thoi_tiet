import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Dùng cái này để reload list khi quay lại
import { readFavorites, removeFavorite } from '../utils/storage';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  // Hàm này tự chạy mỗi khi bạn mở màn hình này lên
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const data = await readFavorites();
    setFavorites(data || []);
  };

  const handleSelectCity = (city) => {
    // Quan trọng: Chuyển về Home và GỬI KÈM thành phố vừa chọn
    navigation.navigate('Home', { selectedCity: city });
  };

  const handleDelete = (city) => {
    Alert.alert(
      "Xóa thành phố",
      `Bạn có chắc muốn xóa ${city.name} khỏi danh sách?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: async () => {
            await removeFavorite(city.id);
            loadFavorites(); // Load lại danh sách ngay
          }, style: 'destructive' 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vị trí đã lưu</Text>
      
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>Chưa lưu vị trí nào.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => handleSelectCity(item)}
            >
              <View style={styles.info}>
                <Ionicons name="location-sharp" size={24} color="#007AFF" />
                <Text style={styles.cityName}>{item.name}</Text>
                {item.country && <Text style={styles.country}>{item.country}</Text>}
              </View>
              
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  info: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cityName: { fontSize: 18, fontWeight: '600', color: '#333' },
  country: { fontSize: 14, color: '#666' },
  deleteBtn: { padding: 8 },
});