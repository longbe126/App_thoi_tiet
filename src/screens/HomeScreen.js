import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, 
  FlatList, StyleSheet, Alert, ScrollView, Image, StatusBar 
} from 'react-native';
import { debounce } from 'lodash';
import * as Location from 'expo-location';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';

import { fetchWeather, geocodeCity } from '../services/weather';
import { addFavorite, removeFavorite, readFavorites, addHistory } from '../utils/storage'; // Đã thêm addHistory

export default function HomeScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cityInfo, setCityInfo] = useState(null); 
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]); 

  // --- LOGIC KHỞI TẠO ---
  useEffect(() => {
    if (route.params?.selectedCity) {
      const city = route.params.selectedCity;
      loadWeatherByCity(city);
      navigation.setParams({ selectedCity: null });
    } else if (!weather) {
      getCurrentLocationWeather();
    }
  }, [route.params?.selectedCity]);

  useFocusEffect(useCallback(() => { loadFavoritesList(); }, []));
  useEffect(() => { checkFavoriteStatus(); }, [cityInfo, favorites]);

  const loadFavoritesList = async () => {
    try { const list = await readFavorites(); setFavorites(list || []); } catch (e) { setFavorites([]); }
  };

  const checkFavoriteStatus = async () => {
    if (!cityInfo || !cityInfo.id) return;
    setIsFavorite(!!favorites.find(c => c.id === cityInfo.id));
  };

  const loadDefaultLocation = async () => {
      console.log("GPS thất bại -> Load mặc định Đà Nẵng");
      const defaultCity = {
          id: 1583992, 
          name: "Đà Nẵng", 
          country: "Vietnam",
          latitude: 16.0544, 
          longitude: 108.2022 
      };
      await loadWeatherByCity(defaultCity);
      Alert.alert("Chế độ mặc định", "Máy ảo không có GPS. Đã chuyển về Đà Nẵng.");
  };

  const getCurrentLocationWeather = async () => {
    setLoading(true); 
    setSearchQuery(''); 
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { 
          await loadDefaultLocation();
          setLoading(false); 
          return; 
      }

      let location = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);

      const { latitude, longitude } = location.coords;
      let name = "Vị trí của bạn";
      try {
        let address = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address?.length > 0) name = address[0].city || address[0].region || "Vị trí của bạn";
      } catch (e) {}

      const data = await fetchWeather({ latitude, longitude });
      if (data) { 
          setWeather(data); 
          setCityInfo({ id: 'current-gps', name: name, latitude, longitude }); 
      } else {
          throw new Error("API Error");
      }

    } catch (error) { 
        console.log("Lỗi GPS:", error);
        await loadDefaultLocation();
    } finally { 
        setLoading(false); 
    }
  };

  // --- CẬP NHẬT HÀM NÀY: THÊM addHistory ---
  const loadWeatherByCity = async (city) => {
    setLoading(true); 
    setSearchQuery(city.name);
    try {
      const data = await fetchWeather({ latitude: city.latitude, longitude: city.longitude });
      if (data) { 
          setWeather(data); 
          setCityInfo(city);
          
          // Tự động lưu vào lịch sử tìm kiếm
          addHistory(city); 
      }
    } catch (e) { 
        console.error(e); 
    } finally { 
        setLoading(false); 
    }
  };

  const performSearch = async (text) => {
    if (!text || text.length < 2) return;
    setLoading(true);
    try {
      const locations = await geocodeCity(text);
      if (locations?.length > 0) loadWeatherByCity(locations[0]);
      else Alert.alert("Không tìm thấy", "Kiểm tra lại tên thành phố.");
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };
  const handleSearchDebounced = useCallback(debounce(performSearch, 600), []);
  const onSearchChange = (text) => { setSearchQuery(text); handleSearchDebounced(text); };

  const toggleFavorite = async () => {
    if (!cityInfo?.id) return;
    if (isFavorite) await removeFavorite(cityInfo.id); else await addFavorite(cityInfo);
    await loadFavoritesList(); setTimeout(() => loadFavoritesList(), 500); 
  };

  // --- HELPER FUNCTIONS ---
  const getHour = (dateStr) => {
    if (!dateStr) return "--:--";
    const date = new Date(dateStr);
    return `${date.getHours()}:00`;
  };
  const getDayName = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const days = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    return days[date.getDay()];
  };
  const formatTime = (isoString) => {
      if (!isoString) return "--:--";
      const date = new Date(isoString);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getNext24Hours = () => {
    if (!weather?.hourly?.time) return [];
    const currentHourStr = weather.current?.time; 
    let startIndex = 0;
    if (currentHourStr) {
        startIndex = weather.hourly.time.findIndex(t => t === currentHourStr);
        if (startIndex === -1) {
            const currentHour = new Date().getHours();
            startIndex = weather.hourly.time.findIndex(t => new Date(t).getHours() === currentHour);
        }
    }
    if (startIndex === -1) startIndex = 0;
    return weather.hourly.time.slice(startIndex, startIndex + 24).map((time, i) => {
        const actualIndex = startIndex + i;
        return {
            time: time,
            temp: weather.hourly.temperature_2m?.[actualIndex] || 0,
            code: weather.hourly.weathercode?.[actualIndex] || 0,
        };
    });
  };
  
  const hourlyData = getNext24Hours();

  // --- UI RENDER ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#08244F', '#134CB5', '#0B42AB']} style={styles.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput 
            style={styles.input} placeholder="Tìm thành phố..." placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery} onChangeText={onSearchChange}
          />
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Favorites')}>
          <Ionicons name="list" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={getCurrentLocationWeather}>
          <Ionicons name="navigate" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* FAVORITES CHIPS */}
      {favorites.length > 0 && (
        <View style={{ height: 45, marginBottom: 5 }}>
          <FlatList
            horizontal showsHorizontalScrollIndicator={false}
            data={favorites} extraData={favorites}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.chip, cityInfo?.id === item.id && styles.activeChip]} 
                onPress={() => loadWeatherByCity(item)}
              >
                <Ionicons name="location-sharp" size={12} color={cityInfo?.id === item.id ? "#08244F" : "white"} />
                <Text style={[styles.chipText, cityInfo?.id === item.id && styles.activeChipText]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="white" style={{ marginTop: 100 }} />
      ) : weather && weather.current ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          
          {/* 1. THÔNG TIN CHÍNH */}
          <View style={styles.mainInfo}>
            <Text style={styles.cityName}>
                {cityInfo?.name} <Text style={styles.countryName}>{cityInfo?.country ? `, ${cityInfo.country}` : ''}</Text>
            </Text>
            <Image 
                source={(weather.current.weathercode || 0) > 3 
                    ? require('../../assets/backgrounds/iconMua.png') : require('../../assets/backgrounds/iconThoiTiet.png')} 
                style={{ width: 160, height: 160 }} resizeMode="contain"
            />
            <Text style={styles.temp}>{Math.round(weather.current.temperature_2m || 0)}°</Text>
            <Text style={styles.condition}>{(weather.current.weathercode || 0) > 0 ? "Nhiều mây" : "Trời quang"}</Text>
          </View>

          <TouchableOpacity onPress={toggleFavorite} style={styles.favButtonFloating}>
             <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? "#FF453A" : "white"} />
          </TouchableOpacity>

          {/* 2. DỰ BÁO TỪNG GIỜ */}
          <View style={styles.sectionContainer}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10, paddingHorizontal: 16}}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.sectionTitle}> Dự báo từng giờ</Text>
            </View>
            <FlatList
                horizontal showsHorizontalScrollIndicator={false}
                data={hourlyData}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item, index }) => (
                    <View style={[styles.hourlyItem, index === 0 && styles.hourlyItemActive]}>
                        <Text style={styles.hourlyTime}>{index === 0 ? "Bây giờ" : getHour(item.time)}</Text>
                        <Image 
                            source={(item.code || 0) > 3 ? require('../../assets/backgrounds/iconMua.png') : require('../../assets/backgrounds/iconThoiTiet.png')} 
                            style={{ width: 30, height: 30, marginVertical: 8 }} resizeMode="contain"
                        />
                        <Text style={styles.hourlyTemp}>{Math.round(item.temp)}°</Text>
                    </View>
                )}
            />
          </View>

          {/* 3. CHI TIẾT ĐẦY ĐỦ (GRID 8 Ô) */}
          <View style={{marginTop: 20}}>
             <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10, paddingHorizontal: 16}}>
                <Ionicons name="grid-outline" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.sectionTitle}> Chi tiết trong ngày</Text>
             </View>
             
             <View style={styles.detailGrid}>
                <View style={styles.gridRow}>
                    <DetailItem icon="wind" label="Gió" value={`${weather.current.windspeed_10m || 0} km/h`} />
                    <DetailItem icon="droplet" label="Độ ẩm" value={`${weather.current.relativehumidity_2m || 0}%`} />
                    <DetailItem icon="cloud-rain" label="Mưa" value={`${weather.current.precipitation || 0}%`} />
                    <DetailItem icon="sun" label="UV" value={weather.hourly?.uv_index?.[0] || 0} />
                </View>
                <View style={[styles.gridRow, { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                    <DetailItem icon="thermometer" label="Cảm giác" value={`${Math.round(weather.current.apparent_temperature || 0)}°`} />
                    <DetailItem icon="eye" label="Tầm nhìn" value={`${(weather.current.visibility || 0) / 1000} km`} />
                    <DetailItem icon="arrow-down-circle" label="Áp suất" value={`${weather.current.pressure_msl || 0} hPa`} />
                    <DetailItem icon="sunset" label="Hoàng hôn" value={formatTime(weather.daily?.sunset?.[0])} />
                </View>
             </View>
          </View>

          {/* 4. DỰ BÁO 7 NGÀY */}
          <View style={[styles.sectionContainer, { marginTop: 20, marginHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', padding: 16 }]}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom: 15}}>
                <Ionicons name="calendar-outline" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.sectionTitle}> 7 ngày tới</Text>
            </View>
            {weather.daily?.time?.map((date, index) => (
                <View key={index} style={styles.dailyItem}>
                    <Text style={styles.dayText}>{index === 0 ? "Hôm nay" : getDayName(date)}</Text>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Image 
                            source={(weather.daily.weathercode?.[index] || 0) > 3 ? require('../../assets/backgrounds/iconMua.png') : require('../../assets/backgrounds/iconThoiTiet.png')} 
                            style={{ width: 30, height: 30, marginRight: 10 }} resizeMode="contain"
                        />
                        <Text style={styles.tempRange}>
                            {Math.round(weather.daily.temperature_2m_max?.[index] || 0)}°  
                            <Text style={{color:'rgba(255,255,255,0.5)'}}> {Math.round(weather.daily.temperature_2m_min?.[index] || 0)}°</Text>
                        </Text>
                    </View>
                </View>
            ))}
          </View>

          {/* 5. NÚT XEM CHI TIẾT */}
          <TouchableOpacity 
            style={styles.fullDetailBtn}
            onPress={() => navigation.navigate('WeatherDetail', { weatherData: weather })}
          >
            <Text style={styles.fullDetailText}>Xem biểu đồ & Radar chi tiết</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>

        </ScrollView>
      ) : (
        <View style={{alignItems:'center', marginTop: 100}}>
             <Text style={styles.guideText}>Đang tải...</Text>
        </View>
      )}
    </View>
  );
}

// Component con
const DetailItem = ({ icon, label, value }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
        <Feather name={icon} size={22} color="white" />
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15, marginTop: 5 }}>{value}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { flexDirection: 'row', gap: 10, marginTop: 50, marginHorizontal: 16, marginBottom: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, paddingHorizontal: 15, height: 45 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: 'white' },
  iconBtn: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginLeft: 16 },
  activeChip: { backgroundColor: 'white' },
  chipText: { fontSize: 13, color: 'white', marginLeft: 5, fontWeight: '600' },
  activeChipText: { color: '#08244F' },
  mainInfo: { alignItems: 'center', marginTop: 10 },
  cityName: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  countryName: { fontSize: 18, fontWeight: '400', color: 'rgba(255,255,255,0.7)' },
  temp: { fontSize: 80, fontWeight: 'bold', color: 'white' },
  condition: { fontSize: 20, color: 'rgba(255,255,255,0.9)' },
  favButtonFloating: { position: 'absolute', top: 10, right: 20, backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 50 },
  detailGrid: { marginHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 20 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionContainer: { marginTop: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginLeft: 5 },
  hourlyItem: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 15, marginRight: 10, width: 80 },
  hourlyItemActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.5)', borderWidth: 1 },
  hourlyTime: { color: 'white', fontSize: 13 },
  hourlyTemp: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  dailyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16 },
  dayText: { fontSize: 16, color: 'white', fontWeight: '500' },
  tempRange: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  fullDetailBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 20, marginBottom: 30, backgroundColor: 'rgba(255,255,255,0.15)', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  fullDetailText: { color: 'white', fontSize: 16, fontWeight: '600' },
  guideText: { textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.6)', fontSize: 16 },
});