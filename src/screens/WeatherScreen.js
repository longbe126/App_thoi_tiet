import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView,
  TouchableOpacity, Alert, Keyboard, Dimensions, Animated
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";

import { geocodeCity, fetchWeather } from "../services/weather";

const screenWidth = Dimensions.get('window').width;

// Hàm lấy theme màu dựa vào thời tiết và thời gian
const getWeatherTheme = (weatherCode, isDay) => {
    // Ban đêm
    if (!isDay) {
        if (weatherCode >= 61 && weatherCode <= 82) {
            // Mưa đêm
            return {
                gradient: ['#1a1a2e', '#16213e', '#0f3460'],
                text: '#ffffff',
                subText: '#b8c6db',
                cardBg: 'rgba(255, 255, 255, 0.08)',
                cardBorder: 'rgba(255, 255, 255, 0.1)',
            };
        }
        // Đêm thông thường
        return {
            gradient: ['#0f2027', '#203a43', '#2c5364'],
            text: '#ffffff',
            subText: '#b8c6db',
            cardBg: 'rgba(255, 255, 255, 0.08)',
            cardBorder: 'rgba(255, 255, 255, 0.1)',
        };
    }
    
    // Ban ngày
    if (weatherCode === 0 || weatherCode === 1) {
        // Trời quang
        return {
            gradient: ['#ffffff', '#f5f7fa', '#e8ecf1'],
            text: '#000000',
            subText: '#666666',
            cardBg: 'rgba(0, 0, 0, 0.03)',
            cardBorder: 'rgba(0, 0, 0, 0.05)',
        };
    } else if (weatherCode >= 2 && weatherCode <= 3) {
        // Nhiều mây
        return {
            gradient: ['#e8eaf6', '#c5cae9', '#9fa8da'],
            text: '#1a237e',
            subText: '#5c6bc0',
            cardBg: 'rgba(255, 255, 255, 0.5)',
            cardBorder: 'rgba(26, 35, 126, 0.1)',
        };
    } else if (weatherCode >= 61 && weatherCode <= 82) {
        // Mưa
        return {
            gradient: ['#485563', '#29323c', '#1e272e'],
            text: '#ffffff',
            subText: '#b8c6db',
            cardBg: 'rgba(255, 255, 255, 0.08)',
            cardBorder: 'rgba(255, 255, 255, 0.1)',
        };
    }
    
    // Mặc định
    return {
        gradient: ['#ffffff', '#f5f7fa', '#e8ecf1'],
        text: '#000000',
        subText: '#666666',
        cardBg: 'rgba(0, 0, 0, 0.03)',
        cardBorder: 'rgba(0, 0, 0, 0.05)',
    };
};

// Hàm dịch mã thời tiết
const getWeatherInfo = (code, isDay = 1) => {
    const weatherMapping = {
        0: { text: "Quang đãng", icon: isDay ? "sun" : "moon" },
        1: { text: "Gần quang", icon: isDay ? "sun" : "moon" },
        2: { text: "Ít mây", icon: "cloud" },
        3: { text: "Nhiều mây", icon: "cloud" },
        45: { text: "Sương mù", icon: "cloud" },
        48: { text: "Sương mù dày", icon: "cloud" },
        51: { text: "Mưa phùn", icon: "cloud-drizzle" },
        53: { text: "Mưa phùn", icon: "cloud-drizzle" },
        55: { text: "Mưa phùn dày", icon: "cloud-drizzle" },
        61: { text: "Mưa nhẹ", icon: "cloud-rain" },
        63: { text: "Mưa vừa", icon: "cloud-rain" },
        65: { text: "Mưa to", icon: "cloud-rain" },
        71: { text: "Tuyết nhẹ", icon: "cloud-snow" },
        73: { text: "Tuyết vừa", icon: "cloud-snow" },
        75: { text: "Tuyết dày", icon: "cloud-snow" },
        80: { text: "Mưa rào", icon: "cloud-rain" },
        81: { text: "Mưa rào", icon: "cloud-rain" },
        82: { text: "Mưa rào to", icon: "cloud-rain" },
        95: { text: "Dông", icon: "cloud-lightning" },
        96: { text: "Dông mưa đá", icon: "cloud-lightning" },
        99: { text: "Dông mưa đá", icon: "cloud-lightning" },
    };
    return weatherMapping[code] || { text: "Không rõ", icon: "help-circle" };
};

// Component bảng thông tin nhanh
const QuickInfoCard = ({ icon, label, value, theme }) => {
    return (
        <View style={[styles.quickCard, { 
            backgroundColor: theme.cardBg, 
            borderColor: theme.cardBorder 
        }]}>
            <Feather name={icon} size={20} color={theme.subText} />
            <Text style={[styles.quickLabel, { color: theme.subText }]}>{label}</Text>
            <Text style={[styles.quickValue, { color: theme.text }]}>{value}</Text>
        </View>
    );
};

// Component dự báo 7 ngày
const DailyForecast = ({ dailyData, onSelectDay, theme }) => {
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>7 NGÀY TỚI</Text>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
            {dailyData.time.slice(0, 7).map((t, index) => {
                const day = new Date(t);
                const dayName = index === 0 ? "Hôm nay" : 
                    day.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
                return (
                    <TouchableOpacity 
                        key={t} 
                        style={styles.dailyRow} 
                        onPress={() => onSelectDay(index)}
                    >
                        <Text style={[styles.dailyDay, { color: theme.text }]}>{dayName}</Text>
                        <View style={styles.dailyRight}>
                            <Feather 
                                name={getWeatherInfo(dailyData.weathercode[index]).icon} 
                                size={20} 
                                color={theme.subText} 
                            />
                            <Text style={[styles.dailyTemp, { color: theme.subText }]}>
                                {dailyData.temperature_2m_min[index].toFixed(0)}° - {dailyData.temperature_2m_max[index].toFixed(0)}°
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default function WeatherScreen() {
    const [result, setResult] = useState(null);
    const [city, setCity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();

    useEffect(() => {
        handleSearch({ latitude: 16.0544, longitude: 108.2022 }, { name: "Đà Nẵng" });
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

    const executeSearch = async () => {
        if (!searchQuery) return;
        const locations = await geocodeCity(searchQuery);
        if (locations && locations.length > 0) {
            const firstResult = locations[0];
            const pickedCity = { 
                name: firstResult.name, 
                latitude: firstResult.latitude, 
                longitude: firstResult.longitude 
            };
            handleSearch(
                { latitude: firstResult.latitude, longitude: firstResult.longitude }, 
                pickedCity
            );
        } else { 
            Alert.alert("Không tìm thấy", `Không tìm thấy thành phố "${searchQuery}"`); 
        }
    };

    const goToDetail = (dayIndex = 0) => {
        if (!result) return;
        navigation.navigate('WeatherDetail', { 
            weatherData: result, 
            selectedDayIndex: dayIndex 
        });
    };

    if (loading || !result) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    const current = result.current;
    const todayDaily = result.daily;
    const theme = getWeatherTheme(current.weathercode, current.is_day);
    
    // Cấu hình biểu đồ theo theme
    const chartConfig = {
        backgroundGradientFrom: theme.cardBg,
        backgroundGradientTo: theme.cardBg,
        color: (opacity = 1) => {
            // Nếu là theme tối, dùng màu sáng; nếu sáng dùng màu tối
            const lineColor = current.is_day ? 'rgba(102, 126, 234, ' : 'rgba(255, 255, 255, ';
            return lineColor + opacity + ')';
        },
        labelColor: (opacity = 1) => {
            const labelColor = current.is_day ? 'rgba(100, 100, 100, ' : 'rgba(200, 200, 200, ';
            return labelColor + opacity + ')';
        },
        strokeWidth: 2,
        propsForDots: { 
            r: "4", 
            strokeWidth: "2", 
            stroke: current.is_day ? '#667eea' : '#fff',
            fill: current.is_day ? '#667eea' : '#fff'
        },
        propsForBackgroundLines: { strokeWidth: 0 },
        decimalPlaces: 0,
    };

    return (
        <LinearGradient colors={theme.gradient} style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header với search */}
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
                            onSubmitEditing={executeSearch} 
                        />
                    </View>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Thời tiết hiện tại */}
                    <View style={styles.currentSection}>
                        <Text style={[styles.cityName, { color: theme.text }]}>{city.name}</Text>
                        <Text style={[styles.currentTemp, { color: theme.text }]}>
                            {current.temperature_2m.toFixed(0)}°
                        </Text>
                        <Text style={[styles.weatherDesc, { color: theme.subText }]}>
                            {getWeatherInfo(current.weathercode, current.is_day).text}
                        </Text>
                        <View style={styles.minMaxRow}>
                            <Text style={[styles.minMaxText, { color: theme.subText }]}>
                                C: {todayDaily.temperature_2m_max[0].toFixed(0)}°
                            </Text>
                            <View style={[styles.dot, { backgroundColor: theme.subText }]} />
                            <Text style={[styles.minMaxText, { color: theme.subText }]}>
                                T: {todayDaily.temperature_2m_min[0].toFixed(0)}°
                            </Text>
                        </View>
                    </View>

                    {/* Bảng thông tin nhanh */}
                    <View style={styles.quickInfoGrid}>
                        <QuickInfoCard 
                            icon="droplet" 
                            label="Độ ẩm" 
                            value={`${current.relativehumidity_2m}%`}
                            theme={theme}
                        />
                        <QuickInfoCard 
                            icon="wind" 
                            label="Gió" 
                            value={`${current.windspeed_10m.toFixed(0)} km/h`}
                            theme={theme}
                        />
                        <QuickInfoCard 
                            icon="eye" 
                            label="Tầm nhìn" 
                            value={`${(current.visibility / 1000).toFixed(1)} km`}
                            theme={theme}
                        />
                        <QuickInfoCard 
                            icon="umbrella" 
                            label="Mưa" 
                            value={`${current.precipitation.toFixed(1)} mm`}
                            theme={theme}
                        />
                    </View>

                    {/* Biểu đồ hàng giờ */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>24 GIỜ TỚI</Text>
                        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
                        <View style={styles.chartContainer}>
                            <View style={[styles.chartWrapper, { 
                                backgroundColor: current.is_day ? '#fff' : 'rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                padding: 10,
                            }]}>
                                <LineChart
                                    data={{
                                        labels: result.hourly.time.slice(0, 24).filter((_, i) => i % 3 === 0).map(t => new Date(t).getHours() + 'h'),
                                        datasets: [{ 
                                            data: result.hourly.temperature_2m.slice(0, 24).filter((_, i) => i % 3 === 0) 
                                        }]
                                    }}
                                    width={screenWidth - 68}
                                    height={140}
                                    chartConfig={chartConfig}
                                    bezier
                                    withVerticalLines={false}
                                    withHorizontalLines={false}
                                    withInnerLines={false}
                                    withOuterLines={false}
                                    withVerticalLabels={true}
                                    withHorizontalLabels={false}
                                    style={{ marginLeft: 0 }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Dự báo 7 ngày */}
                    <DailyForecast dailyData={result.daily} onSelectDay={goToDetail} theme={theme} />

                    {/* Nút xem chi tiết */}
                    <TouchableOpacity 
                        style={[styles.detailButton, { 
                            borderColor: theme.cardBorder,
                            backgroundColor: theme.cardBg,
                        }]} 
                        onPress={() => goToDetail(0)}
                    >
                        <Text style={[styles.detailButtonText, { color: theme.text }]}>
                            Xem thêm chi tiết
                        </Text>
                        <Feather name="arrow-right" size={16} color={theme.text} />
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    scrollView: {
        flex: 1,
    },
    currentSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    cityName: {
        fontSize: 28,
        fontWeight: '300',
        marginBottom: 16,
    },
    currentTemp: {
        fontSize: 88,
        fontWeight: '200',
        lineHeight: 88,
    },
    weatherDesc: {
        fontSize: 17,
        marginTop: 8,
    },
    minMaxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    minMaxText: {
        fontSize: 15,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        marginHorizontal: 12,
    },
    quickInfoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    quickCard: {
        width: (screenWidth - 64) / 2,
        marginHorizontal: 8,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    quickLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 8,
        marginBottom: 4,
    },
    quickValue: {
        fontSize: 20,
        fontWeight: '400',
    },
    section: {
        marginHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    dailyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    dailyDay: {
        fontSize: 15,
        fontWeight: '400',
        flex: 1,
    },
    dailyRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dailyTemp: {
        fontSize: 15,
        minWidth: 80,
        textAlign: 'right',
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        paddingVertical: 14,
        borderWidth: 1,
        borderRadius: 12,
        gap: 8,
    },
    detailButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },
});