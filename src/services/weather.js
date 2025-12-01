import { API_BASE } from '../config';
import { normalizeOpenMeteo, normalizeWeatherAPI } from "./weatherAdapter";

// HÀM LẤY CẤU HÌNH TỪ SERVER
const getActiveProvider = async () => {
    try {
        // Gọi API mà bạn vừa thêm vào server.js
        const res = await fetch(`${API_BASE}/api/weather-key`);
        const data = await res.json();
        
        // Nếu server trả về provider hợp lệ thì dùng, không thì mặc định Open-Meteo
        if (data && data.provider) {
            return { provider: data.provider, apiKey: data.key };
        }
        return { provider: 'Open-Meteo', apiKey: '' };
    } catch (e) {
        // Lỗi mạng hoặc server chết -> Dùng mặc định
        return { provider: 'Open-Meteo', apiKey: '' };
    }
};

// 1. TÌM KIẾM (GEOCODING)
export const geocodeCity = async (cityName) => {
    const config = await getActiveProvider();
    
    // Nếu Admin chọn WeatherAPI
    if (config.provider === 'WeatherAPI') {
        const url = `https://api.weatherapi.com/v1/search.json?key=${config.apiKey}&q=${encodeURIComponent(cityName)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data.map(item => ({
                id: item.id,
                name: item.name,
                country: item.country,
                latitude: item.lat,
                longitude: item.lon
            })) || [];
        } catch (e) { return []; }
    }

    // Mặc định: Open-Meteo
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&format=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    } catch (error) { return []; }
};

// 2. LẤY THỜI TIẾT (FORECAST)
export const fetchWeather = async ({ latitude, longitude }) => {
    const config = await getActiveProvider();

    // Nếu Admin chọn WeatherAPI
    if (config.provider === 'WeatherAPI') {
        if (!config.apiKey) return null;
        
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${config.apiKey}&q=${latitude},${longitude}&days=7&aqi=yes&alerts=no`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            // Dùng Adapter để chuẩn hóa dữ liệu
            return normalizeWeatherAPI(data); 
        } catch (e) { return null; }
    }

    // Mặc định: Open-Meteo
    const currentParams = "temperature_2m,relativehumidity_2m,apparent_temperature,is_day,weathercode,windspeed_10m,pressure_msl,visibility,precipitation";
    const hourlyParams = "temperature_2m,weathercode,is_day,uv_index,relativehumidity_2m"; 
    const dailyParams = "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,windspeed_10m_max";
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=auto`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return normalizeOpenMeteo(data);
    } catch (error) {
        return null;
    }
};