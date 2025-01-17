import { ActivityIndicator, Alert, SafeAreaView, ScrollView } from "react-native";
import { Text, View } from "react-native";
import styles from "./styles";
import globalStyles from "@styles/styles";
import InputField from "@components/InputField";
import React, { useState, useEffect } from "react";
import instance from "../../configs/axios";
import Button from "@src/components/Button";

function ProfilScreen() {
  interface formDataProfil {
    _method: string;
    name: string;
    email: string;
    nik: string;
  }

  interface formDataPassword {
    _method: string;
    password: string;
    confirm_password: string;
  }

  const [loading, setLoading] = useState<boolean>(false);

  const [formDataProfil, setFormDataProfil] = useState<formDataProfil>({
    _method: "put",
    name: "",
    email: "",
    nik: "",
  });

  const [formDataPassword, setFormDataPassword] = useState<formDataPassword>({
    _method: "put",
    password: "",
    confirm_password: "",
  });

  const getProfil = async () => {
    try {
      setLoading(true);
      const response = await instance.get('v1/profile');
      setFormDataProfil((prevState) => ({
        ...prevState,
        name: response.data.data.name,
        email: response.data.data.email,
        nik: response.data.data.detail_users?.nik,
      }));
      // console.log(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProfil();
  }, []);

  const handleChangeProfil = (key: string, value: string) => {
    setFormDataProfil((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleChangePassword = (key: string, value: string) => {
    setFormDataPassword((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSave = async (key: string, value: any) => {
    try {
      setLoading(true);
      const response = await instance.put(`v1/profile/${key}`, value);
      // console.log(response.data.data);
      setLoading(false);
      Alert.alert('Success', 'Data berhasil diperbaharui.');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response.data.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView>
        <View style={[globalStyles.formContainer, styles.formGroup, { marginTop: 10, marginBottom: 5 }]}>
          <Text style={styles.title}>Edit Profil</Text>
        </View>
        <View style={[globalStyles.formContainer, styles.formGroup]}>
          <InputField label="Nama" value={formDataProfil.name} onChangeText={(value) => handleChangeProfil("name", value)} placeholder="Masukan Nama Anda" />
          <InputField label="Email" value={formDataProfil.email} onChangeText={(value) => handleChangeProfil("email", value)} placeholder="Masukan Email Anda" />
          <InputField label="NIK" value={formDataProfil.nik} onChangeText={(value) => handleChangeProfil("nik", value)} placeholder="Masukan NIK Anda" />
          <Button label="Simpan" onPress={() => handleSave("", formDataProfil)} />
        </View>
        <View style={[globalStyles.formContainer, styles.formGroup, { marginTop: 10, marginBottom: 5 }]}>
          <Text style={styles.title}>Edit Password</Text>
        </View>
        <View style={[globalStyles.formContainer, styles.formGroup]}>
          <InputField label="Password" value={formDataPassword.password} onChangeText={(value) => handleChangePassword("password", value)} placeholder="Masukan Password Baru" />
          <InputField label="Konfirmasi Password" value={formDataPassword.confirm_password} onChangeText={(value) => handleChangePassword('confirm_password', value)} placeholder="Masukan Konfirmasi Password" />
          <Button label="Simpan" onPress={() => handleSave("update-password", formDataPassword)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfilScreen;