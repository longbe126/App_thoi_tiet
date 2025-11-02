import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { saveUser, savePersonalFile } from "../utils/storage";
import { Picker } from "@react-native-picker/picker";   
export default function RegisterScreen({ navigation }){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [fileMeta, setFileMeta] = useState(null);

  const pickFile = async ()=>{
    const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if(res.canceled) return;
    const f = res.assets[0];
    setFileMeta({ name: f.name, size: f.size, uri: f.uri, mimeType: f.mimeType });
  };

  const onRegister = async ()=>{
    if(!username || !password){ 
      Alert.alert("Thiếu thông tin","Nhập đủ username & password"); 
      return; 
    }
    await saveUser({ username, password, role });   // Lưu role kèm user
    if(fileMeta) await savePersonalFile({ owner: username, ...fileMeta });
    Alert.alert("Thành công", "Đăng ký thành công!");
    navigation.goBack();
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Đăng ký tài khoản</Text>

      <TextInput 
        placeholder="Tên đăng nhập" 
        value={username} 
        onChangeText={setUsername} 
        style={{ borderWidth: 1, padding: 8 }} 
      />

      <TextInput 
        placeholder="Mật khẩu" 
        value={password} 
        secureTextEntry 
        onChangeText={setPassword} 
        style={{ borderWidth: 1, padding: 8 }} 
      />

      {/* Chọn role */}
      <Text>Chọn quyền:</Text>
      <Picker
        selectedValue={role}
        onValueChange={(value)=>setRole(value)}
        style={{ borderWidth: 1 }}
      >
        <Picker.Item label="Người dùng" value="user" />
        <Picker.Item label="Quản trị (Admin)" value="admin" />
      </Picker>

      <Button title="Chọn file cá nhân (tuỳ chọn)" onPress={pickFile} />
      {fileMeta && <Text>Đã chọn: {fileMeta.name} ({fileMeta.size||0}B)</Text>}

      <Button title="Đăng ký" onPress={onRegister} />
    </View>
  );
}
