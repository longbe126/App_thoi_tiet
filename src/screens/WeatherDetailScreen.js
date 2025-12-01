import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- THEME ĐỒNG BỘ VỚI HOME SCREEN ---
const theme = {
    gradient: ['#08244F', '#134CB5', '#0B42AB'], // Xanh đêm giống Home
    text: '#ffffff',
    subText: 'rgba(255, 255, 255, 0.7)',
    cardBg: 'rgba(0, 0, 0, 0.25)', // Kính mờ tối
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    iconColor: '#ffffff'
};

const DetailItem = ({ icon, label, value, unit }) => {
    return (
        <View style={[styles.detailItem, { borderColor: theme.cardBorder }]}>
            <View style={styles.iconContainer}>
                <Feather name={icon} size={24} color={theme.iconColor} />
            </View>
            <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
                {value}
                <Text style={[styles.detailUnit, { color: theme.subText }]}> {unit}</Text>
            </Text>
        </View>
    );
};

const SunInfo = ({ sunrise, sunset }) => {
    // Format giờ: 05:30
    const formatTime = (iso) => {
        if (!iso) return "--:--";
        const d = new Date(iso);
        return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    };

    const sunriseTime = formatTime(sunrise);
    const sunsetTime = formatTime(sunset);
    
    return (
        <View style={styles.sunSection}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom: 15}}>
                <Feather name="sun" size={18} color={theme.subText} style={{marginRight: 8}}/>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>MẶT TRỜI</Text>
            </View>
            
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={styles.sunRow}>
                    <View style={styles.sunItem}>
                        <Feather name="sunrise" size={32} color="#FFD700" />
                        <Text style={[styles.sunLabel, { color: theme.subText }]}>Mọc</Text>
                        <Text style={[styles.sunTime, { color: theme.text }]}>{sunriseTime}</Text>
                    </View>
                    
                    {/* Đường kẻ dọc */}
                    <View style={[styles.sunDivider, { backgroundColor: theme.cardBorder }]} />
                    
                    <View style={styles.sunItem}>
                        <Feather name="sunset" size={32} color="#FF8C00" />
                        <Text style={[styles.sunLabel, { color: theme.subText }]}>Lặn</Text>
                        <Text style={[styles.sunTime, { color: theme.text }]}>{sunsetTime}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const AirQualityCard = ({ uvIndex, precipitation }) => {
    let uvLevel = 'Thấp';
    if (uvIndex > 7) uvLevel = 'Rất cao';
    else if (uvIndex > 5) uvLevel = 'Cao';
    else if (uvIndex > 2) uvLevel = 'Trung bình';
    
    return (
        <View style={[styles.card, { 
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            marginBottom: 30
        }]}>
            <View style={styles.airQualityRow}>
                <View style={styles.airQualityItem}>
                    <Feather name="sun" size={24} color="#FFD700" />
                    <Text style={[styles.airQualityLabel, { color: theme.subText }]}>Chỉ số UV</Text>
                    <Text style={[styles.airQualityValue, { color: theme.text }]}>
                        {uvIndex ? uvIndex.toFixed(1) : 0}
                    </Text>
                    <Text style={[styles.airQualityLevel, { color: theme.subText }]}>{uvLevel}</Text>
                </View>
                
                <View style={[styles.airQualityDivider, { backgroundColor: theme.cardBorder }]} />
                
                <View style={styles.airQualityItem}>
                    <Ionicons name="rainy-outline" size={24} color="#4FACFE" />
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

export default function WeatherDetailScreen({ route, navigation }) {
    const { weatherData, selectedDayIndex } = route.params || {};
    
    // Fallback an toàn nếu không có dữ liệu
    if (!weatherData) {
        return (
            <LinearGradient colors={theme.gradient} style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
                <Text style={{color:'white'}}>Không có dữ liệu chi tiết.</Text>
            </LinearGradient>
        );
    }

    const dayIndex = selectedDayIndex || 0;
    const current = weatherData.current;
    const daily = weatherData.daily;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={theme.gradient} style={styles.background} />

            {/* Header đơn giản có nút Back */}
            <View style={styles.header}>
                <Ionicons name="arrow-back" size={28} color="white" onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>Chi tiết thời tiết</Text>
                <View style={{width: 28}} /> 
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {/* 1. Bảng UV & Mưa */}
                    <AirQualityCard 
                        uvIndex={daily?.uv_index_max?.[dayIndex] || 0}
                        precipitation={daily?.precipitation_probability_max?.[dayIndex] || 0}
                    />

                    {/* 2. Grid thông tin chi tiết */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>CHỈ SỐ HIỆN TẠI</Text>
                    <View style={styles.gridSection}>
                        <DetailItem 
                            icon="droplet" label="Độ ẩm" 
                            value={current.relativehumidity_2m?.toFixed(0)} unit="%" 
                        />
                        <DetailItem 
                            icon="wind" label="Gió" 
                            value={current.windspeed_10m?.toFixed(1)} unit="km/h" 
                        />
                        <DetailItem 
                            icon="thermometer" label="Cảm giác" 
                            value={current.apparent_temperature?.toFixed(0)} unit="°C" 
                        />
                        <DetailItem 
                            icon="cloud-drizzle" label="Lượng mưa" 
                            value={current.precipitation?.toFixed(1)} unit="mm" 
                        />
                        <DetailItem 
                            icon="eye" label="Tầm nhìn" 
                            value={(current.visibility / 1000)?.toFixed(1)} unit="km" 
                        />
                        <DetailItem 
                            icon="activity" label="Áp suất" 
                            value={current.pressure_msl?.toFixed(0)} unit="hPa" 
                        />
                    </View>

                    {/* 3. Thông tin Mặt trời */}
                    <SunInfo 
                        sunrise={daily?.sunrise?.[dayIndex]} 
                        sunset={daily?.sunset?.[dayIndex]}
                    />

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    
    header: {
        marginTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    scrollView: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 20 },

    // Card Styles
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    
    // Air Quality
    airQualityRow: { flexDirection: 'row' },
    airQualityItem: { flex: 1, alignItems: 'center' },
    airQualityDivider: { width: 1, marginHorizontal: 15 },
    airQualityLabel: { fontSize: 13, marginTop: 10, marginBottom: 5 },
    airQualityValue: { fontSize: 32, fontWeight: 'bold' },
    airQualityLevel: { fontSize: 14, fontWeight: '500', marginTop: 5 },

    // Grid Detail
    gridSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -10,
        marginBottom: 30
    },
    detailItem: {
        width: '50%',
        padding: 15,
        marginBottom: 15,
        // Có thể thêm background cho từng item nếu muốn
        // backgroundColor: 'rgba(255,255,255,0.05)',
        // borderRadius: 15,
        // marginHorizontal: 5
    },
    iconContainer: { marginBottom: 10 },
    detailLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
    detailValue: { fontSize: 28, fontWeight: '300' },
    detailUnit: { fontSize: 16 },

    // Sun Section
    sunSection: { marginTop: 0 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
    sunRow: { flexDirection: 'row', alignItems: 'center' },
    sunItem: { flex: 1, alignItems: 'center' },
    sunDivider: { width: 1, height: 60 },
    sunLabel: { fontSize: 13, marginTop: 10, marginBottom: 5 },
    sunTime: { fontSize: 22, fontWeight: '500' },
});