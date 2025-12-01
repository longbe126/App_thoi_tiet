import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { readHistory, clearHistory, removeHistoryItem } from '../utils/storage';

export default function HistoryScreen({ navigation }) {
  const [historyList, setHistoryList] = useState([]);

  // Load lại danh sách mỗi khi vào màn hình này
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await readHistory();
    setHistoryList(data || []);
  };

  const handleSelectCity = (city) => {
    // Chuyển sang Tab Weather -> Màn hình WeatherRoot (Home) và truyền city
    navigation.navigate('Weather', { 
        screen: 'WeatherRoot', 
        params: { selectedCity: city } 
    });
  };

  const handleDeleteItem = async (cityName) => {
    await removeHistoryItem(cityName);
    loadData(); // Reload list
  };

  const handleClearAll = () => {
    Alert.alert("Xóa tất cả", "Bạn có chắc muốn xóa sạch lịch sử tìm kiếm?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa hết", 
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistoryList([]);
        } 
      }
    ]);
  };

  // Hàm tính thời gian "cách đây..."
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#08244F', '#134CB5', '#0B42AB']} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử tìm kiếm</Text>
        {historyList.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={historyList}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={60} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>Chưa có lịch sử tìm kiếm</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.itemCard}
            onPress={() => handleSelectCity(item)}
          >
            <View style={styles.iconBox}>
               <MaterialCommunityIcons name="clock-time-three-outline" size={24} color="white" />
            </View>
            
            <View style={styles.infoBox}>
              <Text style={styles.cityName}>{item.name}</Text>
              <Text style={styles.timeText}>
                {item.country ? `${item.country} • ` : ''} 
                {getTimeAgo(item.at)}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => handleDeleteItem(item.name)}
            >
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  
  header: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  clearText: { color: '#FF453A', fontSize: 16, fontWeight: '500' },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  infoBox: { flex: 1 },
  cityName: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  timeText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  
  deleteBtn: {
    padding: 8,
  },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 10, fontSize: 16 },
});