
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveUser(user){
  await AsyncStorage.setItem(`user:${user.username}`, JSON.stringify(user));
}
export async function getUser(username){
  const s = await AsyncStorage.getItem(`user:${username}`);
  return s ? JSON.parse(s) : null;
}
export async function setSession(username){
  await AsyncStorage.setItem("session", username);
}
export async function getSession(){
  return AsyncStorage.getItem("session");
}
export async function clearSession(){
  await AsyncStorage.removeItem("session");
}

export async function addHistory(q){
  const key = "history";
  const s = await AsyncStorage.getItem(key);
  const arr = s ? JSON.parse(s) : [];
  arr.unshift({ ...q, at: Date.now() });
  await AsyncStorage.setItem(key, JSON.stringify(arr.slice(0,100)));
}
export async function readHistory(){
  const s = await AsyncStorage.getItem("history");
  return s ? JSON.parse(s) : [];
}
export async function clearHistory(){
  await AsyncStorage.removeItem("history");
}

export async function addFavorite(city){
  const key = "favorites";
  const s = await AsyncStorage.getItem(key);
  const arr = s ? JSON.parse(s) : [];
  if(!arr.find(c=>c.id===city.id)) arr.push(city);
  await AsyncStorage.setItem(key, JSON.stringify(arr));
}
export async function readFavorites(){
  const s = await AsyncStorage.getItem("favorites");
  return s ? JSON.parse(s) : [];
}
export async function removeFavorite(id){
  const s = await AsyncStorage.getItem("favorites");
  const arr = s ? JSON.parse(s) : [];
  const out = arr.filter(c=>c.id!==id);
  await AsyncStorage.setItem("favorites", JSON.stringify(out));
}

export async function savePersonalFile(meta){
  await AsyncStorage.setItem("personal_file", JSON.stringify(meta));
}
export async function readPersonalFile(){
  const s = await AsyncStorage.getItem("personal_file");
  return s ? JSON.parse(s) : null;
}
