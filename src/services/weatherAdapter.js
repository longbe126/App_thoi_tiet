// src/services/weatherAdapter.js

// 1. Chuẩn hóa Open-Meteo (Giữ nguyên, không cần sửa)
export const normalizeOpenMeteo = (data) => {
  return data;
};

// 2. Chuẩn hóa WeatherAPI (Biến nó thành giống Open-Meteo)
export const normalizeWeatherAPI = (data) => {
  if (!data || !data.current) return null;

  const forecastDays = data.forecast?.forecastday || [];
  
  return {
    current: {
      temperature_2m: data.current.temp_c,
      relativehumidity_2m: data.current.humidity,
      apparent_temperature: data.current.feelslike_c,
      is_day: data.current.is_day,
      weathercode: mapWeatherCode(data.current.condition.code),
      windspeed_10m: data.current.wind_kph,
      pressure_msl: data.current.pressure_mb,
      visibility: data.current.vis_km * 1000,
      precipitation: data.current.precip_mm,
      time: data.location.localtime 
    },
    hourly: {
        time: forecastDays[0]?.hour.map(h => h.time) || [],
        temperature_2m: forecastDays[0]?.hour.map(h => h.temp_c) || [],
        weathercode: forecastDays[0]?.hour.map(h => mapWeatherCode(h.condition.code)) || [],
        uv_index: forecastDays[0]?.hour.map(h => h.uv) || [],
    },
    daily: {
        time: forecastDays.map(d => d.date),
        weathercode: forecastDays.map(d => mapWeatherCode(d.day.condition.code)),
        temperature_2m_max: forecastDays.map(d => d.day.maxtemp_c),
        temperature_2m_min: forecastDays.map(d => d.day.mintemp_c),
        sunrise: forecastDays.map(d => d.date + 'T' + convert12to24(d.astro.sunrise)),
        sunset: forecastDays.map(d => d.date + 'T' + convert12to24(d.astro.sunset)),
        uv_index_max: forecastDays.map(d => d.day.uv),
        precipitation_probability_max: forecastDays.map(d => d.day.daily_chance_of_rain),
    }
  };
};

// Hàm phụ: Chuyển mã icon WeatherAPI -> Open-Meteo WMO code
const mapWeatherCode = (code) => {
    if (code === 1000) return 0; // Sunny
    if (code === 1003) return 1; // Partly cloudy
    if ([1006, 1009].includes(code)) return 3; // Cloudy
    if ([1063, 1180, 1183, 1186, 1189].includes(code)) return 61; // Rain
    if ([1273, 1276].includes(code)) return 95; // Thunderstorm
    return 2; // Default
};

const convert12to24 = (time12h) => {
    if(!time12h) return "00:00";
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours}:${minutes}`;
};