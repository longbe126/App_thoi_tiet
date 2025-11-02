import React, { useEffect, useState } from "react";
import { View, Text, Button, TextInput, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FavoritesScreen() {
  const [city, setCity] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    fetchFavorites(t);
  };

  const fetchFavorites = async (t) => {
    try {
      const res = await fetch("http://10.0.2.2:3000/favorites", {
        headers: { Authorization: "Bearer " + t },
      });
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addFavorite = async () => {
    if (!city) return;
    try {
      const res = await fetch("http://10.0.2.2:3000/favorites", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city_name: city, lat: 0, lon: 0 }),
      });
      const data = await res.json();
      Alert.alert("Thông báo", data.message);
      setCity("");
      fetchFavorites(token);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFavorite = async (id) => {
    try {
      await fetch(`http://10.0.2.2:3000/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      fetchFavorites(token);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Yêu thích</Text>

      <TextInput
        placeholder="Tên thành phố"
        value={city}
        onChangeText={setCity}
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />
      <Button title="Thêm thành phố" onPress={addFavorite} />

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 5 }}>
            <Text>{item.city_name}</Text>
            <Button title="Xóa" onPress={() => deleteFavorite(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
