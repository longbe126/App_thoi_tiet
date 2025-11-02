// Hàm này lấy thông tin địa lý của thành phố
export const geocodeCity = async (cityName) => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=vi&format=json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to geocode city:", error);
    return [];
  }
};

// --- HÀM GỌI API THỜI TIẾT ĐÃ NÂNG CẤP ---
export const fetchWeather = async ({ latitude, longitude }) => {
  
  const currentParams = "temperature_2m,relativehumidity_2m,apparent_temperature,is_day,weathercode,windspeed_10m,pressure_msl,visibility,precipitation";
  // Thêm is_day vào hourlyParams
  const hourlyParams = "temperature_2m,weathercode,is_day,uv_index,relativehumidity_2m"; 
  const dailyParams = "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,windspeed_10m_max";
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=auto`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
};