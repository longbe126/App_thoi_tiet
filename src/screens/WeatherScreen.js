import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView,
  TouchableOpacity, Alert, Keyboard, FlatList, Dimensions
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";

// Đường dẫn đúng: đi lùi 1 cấp ra src, rồi vào services
import { geocodeCity, fetchWeather } from "../services/weather";

const screenWidth = Dimensions.get('window').width;

// --- HÀM TRỢ GIÚP DỊCH MÃ THỜI TIẾT (ĐÃ SỬA LỖI) ---
const getWeatherInfo = (code, isDay = 1) => {
    // Mapping đầy đủ hơn cho WMO Weather codes
    const weatherMapping = {
        0: { text: "Trời quang", icon: isDay ? "sun" : "moon" },
        1: { text: "Gần quang", icon: isDay ? "sun" : "moon" },
        2: { text: "Ít mây", icon: isDay ? "cloud-sun" : "cloud-moon" },
        3: { text: "Mây rải rác", icon: "cloud" },
        45: { text: "Sương mù", icon: "align-center" },
        48: { text: "Sương mù dày", icon: "align-center" },
        51: { text: "Mưa phùn nhẹ", icon: "cloud-drizzle" },
        53: { text: "Mưa phùn", icon: "cloud-drizzle" },
        55: { text: "Mưa phùn dày", icon: "cloud-drizzle" },
        61: { text: "Mưa rào nhẹ", icon: "cloud-rain" },
        63: { text: "Mưa vừa", icon: "cloud-rain" },
        65: { text: "Mưa to", icon: "cloud-rain" },
        71: { text: "Tuyết rơi nhẹ", icon: "cloud-snow" },
        73: { text: "Tuyết vừa", icon: "cloud-snow" },
        75: { text: "Tuyết rơi dày", icon: "cloud-snow" },
        80: { text: "Mưa rào nhẹ", icon: "cloud-showers-heavy" },
        81: { text: "Mưa rào", icon: "cloud-showers-heavy" },
        82: { text: "Mưa rào to", icon: "cloud-showers-heavy" },
        95: { text: "Dông", icon: "cloud-lightning" },
        96: { text: "Dông có mưa đá", icon: "cloud-lightning" },
        99: { text: "Dông có mưa đá", icon: "cloud-lightning" },
    };
    return weatherMapping[code] || { text: "Không xác định", icon: "help-circle" };
};


// --- COMPONENT CHO DỰ BÁO HÀNG NGÀY (SỬA LẠI ICON) ---
const DailyForecast = ({ dailyData, onSelectDay }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Dự báo 7 ngày</Text>
            {dailyData.time.map((t, index) => {
                const day = new Date(t);
                const dayName = index === 0 ? "Hôm nay" : day.toLocaleDateString('vi-VN', { weekday: 'short' });
                return (
                    <TouchableOpacity key={t} style={styles.dailyItem} onPress={() => onSelectDay(index)}>
                        <Text style={styles.dailyDay}>{dayName}</Text>
                        <Feather 
                            name={getWeatherInfo(dailyData.weathercode[index]).icon} // SỬA LỖI ICON DẤU ?
                            size={24} 
                            color="#333" 
                            style={{marginHorizontal: 15}} 
                        />
                        <Text style={styles.dailyTempMin}>{dailyData.temperature_2m_min[index].toFixed(0)}°</Text>
                        <Text style={styles.dailyTempMax}>{dailyData.temperature_2m_max[index].toFixed(0)}°</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// Cấu hình màu sắc cho biểu đồ (ĐÃ SỬA LẠI)
const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`, // Màu đường line
    labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#4a90e2" },
};

// --- MÀN HÌNH CHÍNH ---
export default function WeatherScreen() {
    const [result, setResult] = useState(null);
    const [city, setCity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigation = useNavigation();

    useEffect(() => {
        handleSearch({ latitude: 16.0544, longitude: 108.2022 }, { name: "Đà Nẵng" });
    }, []);

    const handleSearch = async (loc, pickedCity) => {
        setLoading(true);
        Keyboard.dismiss();
        try {
            const weatherData = await fetchWeather(loc);
            if (weatherData) {
                setResult(weatherData);
                setCity(pickedCity);
            } else { Alert.alert("Lỗi", "Không nhận được dữ liệu từ server."); }
        } catch (error) { Alert.alert("Lỗi", "Không thể lấy dữ liệu thời tiết."); } 
        finally { setLoading(false); }
    };

    const executeSearch = async () => {
        if (!searchQuery) return;
        const locations = await geocodeCity(searchQuery);
        if (locations && locations.length > 0) {
            const firstResult = locations[0];
            const pickedCity = { name: firstResult.name, latitude: firstResult.latitude, longitude: firstResult.longitude };
            handleSearch({ latitude: firstResult.latitude, longitude: firstResult.longitude }, pickedCity);
        } else { Alert.alert("Không tìm thấy", `Không tìm thấy thành phố "${searchQuery}"`); }
    };

    const goToDetail = (dayIndex = 0) => {
        if (!result) return;
        navigation.navigate('WeatherDetail', { weatherData: result, selectedDayIndex: dayIndex });
    };

    if (loading || !result) {
        return <LinearGradient colors={['#74b9ff', '#a29bfe']} style={styles.container}><ActivityIndicator size="large" color="#fff" style={{flex: 1}} /></LinearGradient>;
    }

    const current = result.current;
    const todayDaily = result.daily;
    const isDay = current.is_day === 1;
    // THAY ĐỔI MÀU NỀN DỰA VÀO NGÀY/ĐÊM
    const gradientColors = isDay ? ['#74b9ff', '#e0f7fa'] : ['#2c3e50', '#34495e'];

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <ScrollView>
                <View style={styles.searchContainer}>
                    <TextInput style={styles.searchInput} placeholder="Tìm kiếm thành phố..." placeholderTextColor="#eee" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={executeSearch} />
                    <TouchableOpacity onPress={executeSearch} style={styles.searchButton}><Feather name="search" size={20} color="white" /></TouchableOpacity>
                </View>

                {/* --- THỜI TIẾT HIỆN TẠI (ĐÃ SỬA FONT VÀ LỖI) --- */}
                <View style={styles.currentWeatherContainer}>
                    <Text style={styles.cityName}>{city.name}</Text>
                    <Text style={styles.currentTemp}>{current.temperature_2m.toFixed(0)}°</Text>
                    <Text style={styles.currentWeatherText}>
                        {getWeatherInfo(current.weathercode, current.is_day).text}
                    </Text>
                    <Text style={styles.currentMinMax}>
                        C: {todayDaily.temperature_2m_max[0].toFixed(0)}°  T: {todayDaily.temperature_2m_min[0].toFixed(0)}°
                    </Text>
                    <Text style={styles.currentFeelsLike}>Cảm giác như: {current.apparent_temperature.toFixed(0)}°</Text>
                </View>

                {/* --- DỰ BÁO HÀNG GIỜ (ĐÃ SỬA LẠI BIỂU ĐỒ) --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Dự báo hàng giờ</Text>
                    <LineChart
                        data={{
                            // Lấy 8 mốc thời gian, mỗi mốc cách 3 giờ
                            labels: result.hourly.time.slice(0, 24).filter((_, i) => i % 3 === 0).map(t => new Date(t).getHours() + 'h'),
                            datasets: [{ data: result.hourly.temperature_2m.slice(0, 24).filter((_, i) => i % 3 === 0) }]
                        }}
                        width={screenWidth - 62} // Căn chỉnh lại chiều rộng
                        height={120}
                        chartConfig={chartConfig}
                        bezier
                        withVerticalLines={false}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLabels={true} // Giữ lại nhãn giờ
                        withHorizontalLabels={false} // ẨN NHÃN Y (25.50, 24.90...)
                        style={{marginLeft: -15}} 
                    />
                </View>

                {/* --- DỰ BÁO HÀNG NGÀY (DANH SÁCH) --- */}
                <DailyForecast dailyData={result.daily} onSelectDay={goToDetail} />

                {/* --- NÚT XEM CHI TIẾT --- */}
                <TouchableOpacity style={styles.detailButton} onPress={() => goToDetail(0)}>
                    <Text style={styles.detailButtonText}>Xem thêm chi tiết</Text>
                    <Feather name="chevron-right" size={18} color="#0984e3" />
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

// --- STYLESHEET ĐÃ ĐƯỢC CẬP NHẬT ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    searchContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 50, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20, alignItems: 'center' },
    searchInput: { flex: 1, padding: 12, color: 'white', fontSize: 16 },
    searchButton: { padding: 12 },
    
    currentWeatherContainer: { alignItems: 'center', paddingVertical: 20, marginHorizontal: 16, },
    cityName: { fontSize: 32, color: 'white', fontWeight: 'bold', textAlign: 'center' },
    // THAY ĐỔI FONT CHO GIỐNG THIẾT KẾ
    currentTemp: { fontSize: 120, color: 'white', fontWeight: '200', lineHeight: 120, marginVertical: 10 }, 
    currentWeatherText: { fontSize: 22, color: 'white', fontWeight: '500', textTransform: 'capitalize' },
    currentMinMax: { fontSize: 16, color: 'white', fontWeight: '500', marginTop: 10 },
    currentFeelsLike: { fontSize: 14, color: 'white', opacity: 0.8, marginTop: 5 },

    // THAY ĐỔI CARD CHO NỔI BẬT
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        marginHorizontal: 16, 
        marginBottom: 16, 
        padding: 15, 
        elevation: 3, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 10 },

    dailyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    dailyDay: { fontSize: 16, color: '#333', width: 80, fontWeight: '500' },
    dailyTempMin: { fontSize: 16, color: '#555' },
    dailyTempMax: { fontSize: 16, color: '#333', fontWeight: 'bold', marginLeft: 15 },

    detailButton: { backgroundColor: 'white', borderRadius: 20, padding: 15, margin: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3 },
    detailButtonText: { color: '#0984e3', fontWeight: 'bold', fontSize: 16, marginRight: 5 },
});