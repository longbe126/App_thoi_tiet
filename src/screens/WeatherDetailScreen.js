import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Hàm lấy theme màu (giống WeatherScreen)
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

const DetailItem = ({ icon, label, value, unit, theme }) => {
    return (
        <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
                <Feather name={icon} size={18} color={theme.subText} />
            </View>
            <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
                {value}
                <Text style={[styles.detailUnit, { color: theme.subText }]}> {unit}</Text>
            </Text>
        </View>
    );
};

const SunInfo = ({ sunrise, sunset, theme }) => {
    const sunriseTime = new Date(sunrise).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const sunsetTime = new Date(sunset).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    return (
        <View style={styles.sunSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>MẶT TRỜI</Text>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.sunRow}>
                <View style={styles.sunItem}>
                    <Feather name="sunrise" size={24} color={theme.subText} />
                    <Text style={[styles.sunLabel, { color: theme.subText }]}>Mọc</Text>
                    <Text style={[styles.sunTime, { color: theme.text }]}>{sunriseTime}</Text>
                </View>
                <View style={[styles.sunDivider, { backgroundColor: theme.cardBorder }]} />
                <View style={styles.sunItem}>
                    <Feather name="sunset" size={24} color={theme.subText} />
                    <Text style={[styles.sunLabel, { color: theme.subText }]}>Lặn</Text>
                    <Text style={[styles.sunTime, { color: theme.text }]}>{sunsetTime}</Text>
                </View>
            </View>
        </View>
    );
};

// Component hiển thị chỉ số chất lượng không khí
const AirQualityCard = ({ uvIndex, precipitation, theme }) => {
    let uvLevel = 'Thấp';
    let uvColor = theme.text;
    
    if (uvIndex > 7) {
        uvLevel = 'Rất cao';
    } else if (uvIndex > 5) {
        uvLevel = 'Cao';
    } else if (uvIndex > 2) {
        uvLevel = 'Trung bình';
    }
    
    return (
        <View style={[styles.airQualityCard, { 
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
        }]}>
            <View style={styles.airQualityRow}>
                <View style={styles.airQualityItem}>
                    <Feather name="sun" size={20} color={theme.subText} />
                    <Text style={[styles.airQualityLabel, { color: theme.subText }]}>Chỉ số UV</Text>
                    <Text style={[styles.airQualityValue, { color: theme.text }]}>
                        {uvIndex.toFixed(1)}
                    </Text>
                    <Text style={[styles.airQualityLevel, { color: theme.subText }]}>{uvLevel}</Text>
                </View>
                <View style={[styles.airQualityDivider, { backgroundColor: theme.cardBorder }]} />
                <View style={styles.airQualityItem}>
                    <Feather name="cloud-rain" size={20} color={theme.subText} />
                    <Text style={[styles.airQualityLabel, { color: theme.subText }]}>Khả năng mưa</Text>
                    <Text style={[styles.airQualityValue, { color: theme.text }]}>
                        {precipitation}%
                    </Text>
                    <Text style={[styles.airQualityLevel, { color: theme.subText }]}>
                        {precipitation > 70 ? 'Rất cao' : precipitation > 40 ? 'Cao' : 'Thấp'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default function WeatherDetailScreen({ route }) {
    const { weatherData, selectedDayIndex } = route.params;
    const dayIndex = selectedDayIndex || 0;
    const current = weatherData.current;
    const daily = weatherData.daily;
    
    const theme = getWeatherTheme(current.weathercode, current.is_day);

    return (
        <LinearGradient colors={theme.gradient} style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Bảng chất lượng không khí */}
                    <AirQualityCard 
                        uvIndex={daily.uv_index_max[dayIndex]}
                        precipitation={daily.precipitation_probability_max[dayIndex]}
                        theme={theme}
                    />

                    {/* Grid thông tin */}
                    <View style={styles.gridSection}>
                        <DetailItem 
                            icon="droplet" 
                            label="Độ ẩm" 
                            value={current.relativehumidity_2m.toFixed(0)} 
                            unit="%" 
                            theme={theme}
                        />
                        <DetailItem 
                            icon="wind" 
                            label="Gió" 
                            value={current.windspeed_10m.toFixed(1)} 
                            unit="km/h" 
                            theme={theme}
                        />
                        <DetailItem 
                            icon="thermometer" 
                            label="Cảm giác như" 
                            value={current.apparent_temperature.toFixed(0)} 
                            unit="°C" 
                            theme={theme}
                        />
                        <DetailItem 
                            icon="umbrella" 
                            label="Lượng mưa" 
                            value={current.precipitation.toFixed(1)} 
                            unit="mm" 
                            theme={theme}
                        />
                        <DetailItem 
                            icon="eye" 
                            label="Tầm nhìn" 
                            value={(current.visibility / 1000).toFixed(1)} 
                            unit="km" 
                            theme={theme}
                        />
                        <DetailItem 
                            icon="activity" 
                            label="Áp suất" 
                            value={current.pressure_msl.toFixed(0)} 
                            unit="hPa" 
                            theme={theme}
                        />
                    </View>

                    {/* Thông tin mặt trời */}
                    <SunInfo 
                        sunrise={daily.sunrise[dayIndex]} 
                        sunset={daily.sunset[dayIndex]}
                        theme={theme}
                    />

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    airQualityCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
    },
    airQualityRow: {
        flexDirection: 'row',
    },
    airQualityItem: {
        flex: 1,
        alignItems: 'center',
    },
    airQualityDivider: {
        width: 1,
        marginHorizontal: 20,
    },
    airQualityLabel: {
        fontSize: 12,
        marginTop: 12,
        marginBottom: 8,
    },
    airQualityValue: {
        fontSize: 32,
        fontWeight: '300',
    },
    airQualityLevel: {
        fontSize: 13,
        marginTop: 4,
    },
    gridSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    detailItem: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 32,
    },
    iconContainer: {
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    detailValue: {
        fontSize: 32,
        fontWeight: '300',
    },
    detailUnit: {
        fontSize: 18,
        fontWeight: '300',
    },
    sunSection: {
        marginTop: 16,
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
        marginBottom: 24,
    },
    sunRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sunItem: {
        flex: 1,
        alignItems: 'center',
    },
    sunDivider: {
        width: 1,
        height: 60,
    },
    sunLabel: {
        fontSize: 13,
        marginTop: 12,
        marginBottom: 4,
    },
    sunTime: {
        fontSize: 20,
        fontWeight: '300',
    },
});