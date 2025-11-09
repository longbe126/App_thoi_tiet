import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView,
  TouchableOpacity, Alert, Keyboard, Dimensions, Animated
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { geocodeCity, fetchWeather } from "../services/weather";

const screenWidth = Dimensions.get('window').width;


//===================== THEME ===========================
const getWeatherTheme = (weatherCode, isDay) => {
  if (!isDay) {
    if (weatherCode >= 61 && weatherCode <= 82) {
      return {
        gradient: ['#1a1a2e', '#16213e', '#0f3460'],
        text: '#ffffff',
        subText: '#b8c6db',
        cardBg: 'rgba(255, 255, 255, 0.08)',
        cardBorder: 'rgba(255, 255, 255, 0.1)',
      };
    }
    return {
      gradient: ['#0f2027', '#203a43', '#2c5364'],
      text: '#ffffff',
      subText: '#b8c6db',
      cardBg: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
    };
  }

  if (weatherCode === 0 || weatherCode === 1) {
    return {
      gradient: ['#ffffff', '#f5f7fa', '#e8ecf1'],
      text: '#000000',
      subText: '#666666',
      cardBg: 'rgba(0, 0, 0, 0.03)',
      cardBorder: 'rgba(0, 0, 0, 0.05)',
    };
  } else if (weatherCode >= 2 && weatherCode <= 3) {
    return {
      gradient: ['#e8eaf6', '#c5cae9', '#9fa8da'],
      text: '#1a237e',
      subText: '#5c6bc0',
      cardBg: 'rgba(255, 255, 255, 0.5)',
      cardBorder: 'rgba(26, 35, 126, 0.1)',
    };
  } else if (weatherCode >= 61 && weatherCode <= 82) {
    return {
      gradient: ['#485563', '#29323c', '#1e272e'],
      text: '#ffffff',
      subText: '#b8c6db',
      cardBg: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
    };
  }

  return {
    gradient: ['#ffffff', '#f5f7fa', '#e8ecf1'],
    text: '#000000',
    subText: '#666666',
    cardBg: 'rgba(0, 0, 0, 0.03)',
    cardBorder: 'rgba(0, 0, 0, 0.05)',
  };
};


//===================== WEATHER TEXT ===========================
const getWeatherInfo = (code, isDay = 1) => {
  const weatherMapping = {
    0: { text: "Quang đãng", icon: isDay ? "sun" : "moon" },
    1: { text: "Gần quang", icon: isDay ? "sun" : "moon" },
    2: { text: "Ít mây", icon: "cloud" },
    3: { text: "Nhiều mây", icon: "cloud" },
    61: { text: "Mưa nhẹ", icon: "cloud-rain" },
    63: { text: "Mưa vừa", icon: "cloud-rain" },
    65: { text: "Mưa to", icon: "cloud-rain" },
    80: { text: "Mưa rào", icon: "cloud-rain" },
    82: { text: "Mưa rào to", icon: "cloud-rain" },
  };
  return weatherMapping[code] || { text: "Không rõ", icon: "help-circle" };
};


//===================== LỊCH SỬ TÌM KIẾM ===========================
const saveSearchHistory = async (cityName) => {
  try {
    const old = JSON.parse(await AsyncStorage.getItem("history") || "[]");
    const filtered = old.filter(item => item !== cityName);
    const updated = [cityName, ...filtered].slice(0, 20);
    await AsyncStorage.setItem("history", JSON.stringify(updated));
  } catch (e) {
    console.log("Failed to save history", e);
  }
};


//===================== YÊU THÍCH ===========================
const addFavoriteCity = async (city) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) return Alert.alert("Bạn chưa đăng nhập");

  await fetch("http://10.0.2.2:3000/favorites", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      city_name: city.name,
      lat: city.latitude,
      lon: city.longitude
    }),
  });

  Alert.alert("Thành công", "Đã thêm vào yêu thích");
};


//===================== MAIN SCREEN ===========================
export default function WeatherScreen() {

  const navigation = useNavigation();
  const route = useRoute();

  const [result, setResult] = useState(null);
  const [city, setCity] = useState({ name: "Đà Nẵng" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Nếu mở từ History/Favorites
  useEffect(() => {
    if (route.params?.cityName) {
      setSearchQuery(route.params.cityName);
      executeSearch(route.params.cityName);
    }
  }, [route.params]);

  // Load mặc định
  useEffect(() => {
    handleSearch(
      { latitude: 16.0544, longitude: 108.2022 },
      { name: "Đà Nẵng", latitude: 16.0544, longitude: 108.2022 }
    );
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  // Search
  const handleSearch = async (loc, pickedCity) => {
    setLoading(true);
    fadeAnim.setValue(0);
    Keyboard.dismiss();
    try {
      const weatherData = await fetchWeather(loc);
      if (weatherData) {
        setResult(weatherData);
        setCity(pickedCity);
      } else {
        Alert.alert("Lỗi", "Không nhận được dữ liệu từ server.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy dữ liệu thời tiết.");
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (queryOverride = null) => {
    const query = queryOverride || searchQuery;
    if (!query) return;

    const locations = await geocodeCity(query);
    if (locations && locations.length > 0) {
      const first = locations[0];
      const pickedCity = {
        name: first.name,
        latitude: first.latitude,
        longitude: first.longitude
      };

      handleSearch(
        { latitude: first.latitude, longitude: first.longitude },
        pickedCity
      );

      saveSearchHistory(first.name);

    } else {
      Alert.alert("Không tìm thấy", `Không tìm thấy thành phố "${query}"`);
    }
  };

  const goToDetail = (dayIndex = 0) => {
    navigation.navigate('WeatherDetail', {
      weatherData: result,
      selectedDayIndex: dayIndex
    });
  };


  // Loading screen
  if (loading || !result) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const current = result.current;
  const daily = result.daily;
  const hourly = result.hourly;
  const theme = getWeatherTheme(current.weathercode, current.is_day);


  //======================= CHART CONFIG =========================
  const chartConfig = {
    backgroundGradientFrom: theme.cardBg,
    backgroundGradientTo: theme.cardBg,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: () => theme.subText,
    strokeWidth: 2,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#667eea",
      fill: "#667eea"
    },
    propsForBackgroundLines: {
      stroke: theme.cardBorder,
      strokeWidth: 1
    },
    decimalPlaces: 0,
  };



  //======================= UI =========================
  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* SEARCH */}
        <View style={styles.header}>
          <View style={[styles.searchContainer, {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
          }]}>
            <Feather name="search" size={18} color={theme.subText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Tìm kiếm thành phố"
              placeholderTextColor={theme.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => executeSearch()}
            />
          </View>
        </View>


        <ScrollView showsVerticalScrollIndicator={false}>

          {/* CURRENT WEATH */}
          <View style={styles.currentSection}>
            <Text style={[styles.cityName, { color: theme.text }]}>{city.name}</Text>
            <Text style={[styles.currentTemp, { color: theme.text }]}>
              {current.temperature_2m.toFixed(0)}°
            </Text>
            <Text style={[styles.weatherDesc, { color: theme.subText }]}>
              {getWeatherInfo(current.weathercode, current.is_day).text}
            </Text>
          </View>



          {/* CHART 24H */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>24 GIỜ TỚI</Text>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: hourly.time.slice(0, 24).filter((_, i) => i % 4 === 0).map(t =>
                    new Date(t).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      hour12: false
                    })
                  ),
                  datasets: [{
                    data: hourly.temperature_2m.slice(0, 24).filter((_, i) => i % 4 === 0)
                  }]
                }}
                width={screenWidth - 48}
                height={180}
                chartConfig={chartConfig}
                bezier
                withDots={true}
                withVerticalLabels={true}
                withInnerLines={false}
                withOuterLines={false}
                style={{ borderRadius: 12 }}
              />
            </View>
          </View>



          {/* ==================== 7 NGÀY TỚI ==================== */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>7 NGÀY TỚI</Text>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {daily.time.slice(0, 7).map((t, index) => {
              const day = new Date(t);
              const dayName = index === 0
                ? "Hôm nay"
                : day.toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'numeric'
                });

              return (
                <TouchableOpacity
                  key={t}
                  style={styles.dailyRow}
                  onPress={() => goToDetail(index)}
                >
                  <Text style={[styles.dailyDay, { color: theme.text }]}>
                    {dayName}
                  </Text>

                  <View style={styles.dailyRight}>
                    <Feather
                      name={getWeatherInfo(daily.weathercode[index]).icon}
                      size={20}
                      color={theme.subText}
                    />
                    <Text style={[styles.dailyTemp, { color: theme.subText }]}>
                      {daily.temperature_2m_min[index].toFixed(0)}° - {daily.temperature_2m_max[index].toFixed(0)}°
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>



          {/* DETAIL BUTTON */}
          <TouchableOpacity
            style={[styles.detailButton, {
              borderColor: theme.cardBorder,
              backgroundColor: theme.cardBg,
            }]}
            onPress={() => goToDetail(0)}
          >
            <Text style={[styles.detailButtonText, { color: theme.text }]}>Xem thêm chi tiết</Text>
            <Feather name="arrow-right" size={16} color={theme.text} />
          </TouchableOpacity>



          {/* ADD FAVORITE */}
          <TouchableOpacity
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 12,
              backgroundColor: theme.cardBg,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginHorizontal: 24
            }}
            onPress={() => addFavoriteCity(city)}
          >
            <Feather name="heart" size={18} color={theme.text} />
            <Text style={{ color: theme.text, fontSize: 15 }}>Thêm vào yêu thích</Text>
          </TouchableOpacity>


          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}



//===================== STYLE ===========================
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  currentSection: { alignItems: 'center', paddingVertical: 40 },
  cityName: { fontSize: 28, fontWeight: '300', marginBottom: 10 },
  currentTemp: { fontSize: 88, fontWeight: '200', lineHeight: 88 },
  weatherDesc: { fontSize: 17, marginTop: 8 },

  section: { marginHorizontal: 24, marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  divider: { height: 1, marginBottom: 16 },

  chartContainer: { alignItems: 'center', paddingVertical: 8 },

  dailyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  dailyDay: { fontSize: 15 },
  dailyRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dailyTemp: { fontSize: 15, minWidth: 80, textAlign: 'right' },

  detailButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, paddingVertical: 14, borderWidth: 1, borderRadius: 12, gap: 8 },
  detailButtonText: { fontSize: 15, fontWeight: '500' },
});
