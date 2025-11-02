import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Component Thẻ Chi Tiết
const DetailCard = ({ icon, title, value, unit }) => {
    return (
        <View style={styles.detailCard}>
            <Feather name={icon} size={20} color="#555" />
            <Text style={styles.detailTitle}>{title}</Text>
            <Text style={styles.detailValue}>{value}
                <Text style={styles.detailUnit}> {unit}</Text>
            </Text>
        </View>
    );
};

// Component Thẻ Mặt Trời
const SunCard = ({ sunrise, sunset }) => {
    const sunriseTime = new Date(sunrise).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(sunset).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return (
        <View style={styles.sunCard}>
            <View style={styles.sunItem}>
                <Feather name="sunrise" size={30} color="#f39c12" />
                <Text style={styles.sunTitle}>Mặt trời mọc</Text>
                <Text style={styles.sunTime}>{sunriseTime}</Text>
            </View>
            <View style={styles.sunItem}>
                <Feather name="sunset" size={30} color="#e67e22" />
                <Text style={styles.sunTitle}>Mặt trời lặn</Text>
                <Text style={styles.sunTime}>{sunsetTime}</Text>
            </View>
        </View>
    );
};


export default function WeatherDetailScreen({ route }) {
    const { weatherData, selectedDayIndex } = route.params;
    
    // Lấy dữ liệu cho ngày được chọn (mặc định là ngày 0 - hôm nay)
    const dayIndex = selectedDayIndex || 0;
    const current = weatherData.current;
    const daily = weatherData.daily;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.gridContainer}>
                {/* Hàng 1 */}
                <DetailCard icon="umbrella" title="Lượng mưa" value={current.precipitation.toFixed(1)} unit="mm" />
                <DetailCard icon="wind" title="Gió" value={current.windspeed_10m.toFixed(1)} unit="km/h" />
                
                {/* Hàng 2 */}
                <DetailCard icon="thermometer" title="Cảm giác như" value={current.apparent_temperature.toFixed(0)} unit="°" />
                <DetailCard icon="droplet" title="Độ ẩm" value={current.relativehumidity_2m.toFixed(0)} unit="%" />

                {/* Hàng 3 */}
                <DetailCard icon="sun" title="Chỉ số UV" value={daily.uv_index_max[dayIndex].toFixed(1)} unit="" />
                <DetailCard icon="eye" title="Tầm nhìn" value={(current.visibility / 1000).toFixed(1)} unit="km" />

                {/* Hàng 4 */}
                <DetailCard icon="arrow-down-circle" title="Áp suất" value={current.pressure_msl.toFixed(0)} unit="hPa" />
                <DetailCard icon="cloud-drizzle" title="Khả năng mưa" value={daily.precipitation_probability_max[dayIndex]} unit="%" />
            </View>

            {/* Thẻ Mặt trời mọc/lặn */}
            <SunCard sunrise={daily.sunrise[dayIndex]} sunset={daily.sunset[dayIndex]} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        padding: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 8,
    },
    detailCard: {
        width: '48%', // Chiếm gần 1 nửa
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    detailTitle: {
        fontSize: 14,
        color: '#555',
        marginTop: 10,
    },
    detailValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    detailUnit: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#555',
    },
    sunCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 8,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
    },
    sunItem: {
        alignItems: 'center',
    },
    sunTitle: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    sunTime: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 2,
    }
});