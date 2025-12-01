import AsyncStorage from "@react-native-async-storage/async-storage";

// ================== QUẢN LÝ USER & SESSION ==================

export async function saveUser(user) {
  try {
    await AsyncStorage.setItem(`user:${user.username}`, JSON.stringify(user));
  } catch (e) {
    console.error("Lỗi saveUser:", e);
  }
}

export async function getUser(username) {
  try {
    const s = await AsyncStorage.getItem(`user:${username}`);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

export async function setSession(username) {
  try {
    await AsyncStorage.setItem("session", username);
  } catch (e) {
    console.error("Lỗi setSession:", e);
  }
}

export async function getSession() {
  try {
    return await AsyncStorage.getItem("session");
  } catch (e) {
    return null;
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem("session");
  } catch (e) {
    console.error("Lỗi clearSession:", e);
  }
}

// --- HÀM PHỤ: TẠO KEY THEO USERNAME ---
// Giúp phân chia dữ liệu cho từng người
async function getKey(baseKey) {
  const username = await getSession();
  if (username) {
    return `${baseKey}_${username}`; // Ví dụ: history_nguyenvanA
  }
  return baseKey; // Nếu chưa đăng nhập thì dùng key chung
}

// ================== QUẢN LÝ LỊCH SỬ (HISTORY) ==================

export async function addHistory(q) {
  try {
    const key = await getKey("history"); // Lấy key riêng
    const s = await AsyncStorage.getItem(key);
    let arr = s ? JSON.parse(s) : [];
    
    // Lọc trùng
    arr = arr.filter(item => item.name !== q.name);
    
    // Thêm mới lên đầu
    arr.unshift({ ...q, at: Date.now() });
    
    // Lưu (tối đa 20)
    await AsyncStorage.setItem(key, JSON.stringify(arr.slice(0, 20)));
  } catch (e) {
    console.error("Lỗi addHistory:", e);
  }
}

export async function readHistory() {
  try {
    const key = await getKey("history");
    const s = await AsyncStorage.getItem(key);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
}

export async function removeHistoryItem(cityName) {
  try {
    const key = await getKey("history");
    const s = await AsyncStorage.getItem(key);
    let arr = s ? JSON.parse(s) : [];
    
    const newArr = arr.filter(item => item.name !== cityName);
    
    await AsyncStorage.setItem(key, JSON.stringify(newArr));
  } catch (e) {
    console.error("Lỗi xóa history item:", e);
  }
}

export async function clearHistory() {
  try {
    const key = await getKey("history");
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Lỗi clearHistory:", e);
  }
}

// ================== QUẢN LÝ YÊU THÍCH (FAVORITES) ==================

export async function addFavorite(city) {
  try {
    if (!city || !city.id) return;

    const key = await getKey("favorites"); // Lấy key riêng
    const s = await AsyncStorage.getItem(key);
    const arr = s ? JSON.parse(s) : [];

    const exists = arr.find(c => c.id === city.id);
    if (!exists) {
      arr.push(city);
      await AsyncStorage.setItem(key, JSON.stringify(arr));
      console.log("Đã thêm yêu thích:", city.name);
    }
  } catch (e) {
    console.error("Lỗi addFavorite:", e);
  }
}

export async function readFavorites() {
  try {
    const key = await getKey("favorites");
    const s = await AsyncStorage.getItem(key);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
}

export async function removeFavorite(id) {
  try {
    const key = await getKey("favorites");
    const s = await AsyncStorage.getItem(key);
    let arr = s ? JSON.parse(s) : [];
    
    const out = arr.filter(c => c.id !== id);
    
    await AsyncStorage.setItem(key, JSON.stringify(out));
    console.log("Đã xóa yêu thích ID:", id);
  } catch (e) {
    console.error("Lỗi removeFavorite:", e);
  }
}

// ================== QUẢN LÝ FILE CÁ NHÂN ==================

export async function savePersonalFile(meta) {
  try {
    // File cá nhân thường gắn liền với user rồi, nhưng chia key cho chắc
    const key = await getKey("personal_file"); 
    await AsyncStorage.setItem(key, JSON.stringify(meta));
  } catch (e) {
    console.error("Lỗi savePersonalFile:", e);
  }
}

export async function readPersonalFile() {
  try {
    const key = await getKey("personal_file");
    const s = await AsyncStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}