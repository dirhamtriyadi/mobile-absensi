import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, PermissionsAndroid, Platform, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from 'react-native-date-picker';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { launchCamera } from 'react-native-image-picker';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import instance from "../../configs/axios";
import { useUserData } from "../../hooks/useUserData";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import dayjs from "dayjs";
import { useNotification } from "../../hooks/useNotification";

function SakitScreen() {
  const [image, setImage] = useState<any>(null);
  const [openDatePickerStartDate, setOpenDatePickerStartDate] = useState(false);
  const [openDatePickerEndDate, setOpenDatePickerEndDate] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const { userDetailData } = useUserData();
  const { location, getCurrentLocation } = useCurrentLocation();
  const { showNotification } = useNotification();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [data, setData] = useState({
    code: '',
    nik: '',
    name: '',
    start_date: dayjs(),
    end_date: dayjs(),
    time_check_in: dayjs(),
    type: 'sick',
    image_check_in: '',
    location_check_in: '',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (location.latitude !== 0 && location.longitude !== 0) {
      setData((prevData) => ({
        ...prevData,
        latitude: location.latitude,
        longitude: location.longitude,
        location_check_in: location.locationString
      }));
    }
  }, [location]);

  useEffect(() => {
    setData((prevData) => ({
      ...prevData,
      code: userDetailData.name + data.start_date.format('DD/MM/YYYY'),
      nik: userDetailData.nik,
      name: userDetailData.name,
    }));
  }, [userDetailData, data.start_date]);

  const handleDateChangeStartDate = (selectedDate: Date) => {
    // setData((prevData) => ({ ...prevData, date: selectedDate }));
    setData((prevData) => ({ ...prevData, start_date: dayjs(selectedDate) }));
    setOpenDatePickerStartDate(false);
  };

  const handleDateChangeEndDate = (selectedDate: Date) => {
    // setData((prevData) => ({ ...prevData, date: selectedDate }));
    setData((prevData) => ({ ...prevData, end_date: dayjs(selectedDate) }));
    setOpenDatePickerEndDate(false);
  };

  const handleTimeChange = (selectedTime: Date) => {
    // setData((prevData) => ({ ...prevData, time_check_in: selectedTime }));
    setData((prevData) => ({ ...prevData, time_check_in: dayjs(selectedTime) }));
    setOpenTimePicker(false);
  };

  const handleLocationChange = (text: string) => {
    const [latitude, longitude] = text.split(',').map(coord => parseFloat(coord.trim()));
    if (!isNaN(latitude) && !isNaN(longitude)) {
      setData((prevData) => ({
        ...prevData,
        location: text,
        latitude,
        longitude
      }));
    } else {
      setData((prevData) => ({
        ...prevData,
        location: text
      }));
    }
  };

  const handleClickOpenCamera = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return Alert.alert('Permission Denied', 'Camera permission is required');
      }
    }

    await launchCamera({
      mediaType: 'photo',
      quality: 0.5,
      // includeBase64: true,
      cameraType: 'front',
    }, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorMessage);
      } else {
        setImage(response.assets[0]);
        setData((prevData) => ({ ...prevData, image_check_in: response.assets[0] }));
      }
    });

  }

  const handleClickResetCamera = async () => {
    setImage('');
    setData((prevData) => ({ ...prevData, image_check_in: '' }));
  }

  const handleSubmit = async () => {

    // add validation here
    if (data.code === '') {
      return Alert.alert('Kode absen harus diisi');
    }
    if (data.nik === '') {
      return Alert.alert('NIK harus diisi');
    }
    if (data.name === '') {
      return Alert.alert('Nama harus diisi');
    }
    // if (data.image_check_in === '') {
    //   return Alert.alert('Bukti sakit / surat Dokter harus diisi');
    // }
    if (data.location_check_in === '') {
      return Alert.alert('Lokasi harus diisi');
    }

    try {
      const { start_date, end_date, time_check_in, type, location_check_in } = data;

      const formData = new FormData();

      formData.append('start_date', start_date.format('YYYY-MM-DD'));
      formData.append('end_date', end_date.format('YYYY-MM-DD'));
      formData.append('time_check_in', time_check_in.format('HH:mm:ss'));
      formData.append('type', type);
      formData.append('location_check_in', location_check_in);

      // Add image file to formData
      if (image) {
        formData.append('image_check_in', {
          uri: image.uri,
          type: image.type,
          name: image.fileName,
        });
      }

      instance.defaults.headers['Content-Type'] = 'multipart/form-data';

      await instance.post('v1/attendances/sick', formData);
      Alert.alert('Absen sakit berhasil', 'Absen sakit berhasil disubmit', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        }
      ]);
      showNotification('Absen sakit berhasil', 'Absen sakit berhasil disubmit');
    } catch (error: any) {
      if (error.response?.data?.message?.code) {
        error.response?.data?.message?.code.map((item: any) => {
          console.log(item);
          return Alert.alert('Absen Sakit Gagal', item);
        });
      } else {
        Alert.alert('Absen Sakit Gagal', 'Gagal terjadi kesalahan karena:\n' + error.response.data.message);
        console.log('Error submitting absen sakit: ', error.response.data.message);
      }
    }
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <ScrollView>
        <View style={[styles.formContainer]}>
          <View style={[styles.groupField, { marginTop: 10 }]}>
            <Text style={[styles.fieldLabel]}>Kode Absen</Text>
            <TextInput
              style={[styles.fieldInput]}
              placeholder="Kode"
              value={data.code}
              onChangeText={(text) => setData((prevData) => ({ ...prevData, code: text }))}
            />
          </View>
          <View style={[styles.groupField]}>
            <Text style={[styles.fieldLabel]}>NIK</Text>
            <TextInput
              style={[styles.fieldInput]}
              placeholder="NIK"
              value={data.nik}
              onChangeText={(text) => setData((prevData) => ({ ...prevData, nik: text }))}
            />
          </View>
          <View style={[styles.groupField]}>
            <Text style={[styles.fieldLabel]}>Nama</Text>
            <TextInput
              style={[styles.fieldInput]}
              placeholder="Nama"
              value={data.name}
              onChangeText={(text) => setData((prevData) => ({ ...prevData, name: text }))}
            />
          </View>
          <View style={[styles.groupField]}>
            <Text style={[styles.fieldLabel]}>Tanggal Awal Sakit</Text>
            <View style={{ width: '100%', height: 45, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10, justifyContent: 'center' }}>
              <TextInput
                style={{ color: '#242c40' }}
                placeholder="Tanggal Awal Sakit"
                value={data.start_date.format('DD/MM/YYYY')}
                editable={false}
              />
              <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={() => setOpenDatePickerStartDate(true)}>
                <Icon name="calendar" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.groupField]}>
            <Text style={[styles.fieldLabel]}>Tanggal Akhir Sakit</Text>
            <View style={{ width: '100%', height: 45, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10, justifyContent: 'center' }}>
              <TextInput
                style={{ color: '#242c40' }}
                placeholder="Tanggal Akhir Sakit"
                value={data.end_date.format('DD/MM/YYYY')}
                editable={false}
              />
              <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={() => setOpenDatePickerEndDate(true)}>
                <Icon name="calendar" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.groupField]}>
            <Text style={[styles.fieldLabel]}>Jam</Text>
            <View style={{ width: '100%', height: 45, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10, justifyContent: 'center' }}>
              <TextInput
                style={{ color: '#242c40' }}
                placeholder="Jam"
                value={data.time_check_in.format('HH:mm:ss')}
                editable={false}
              />
              <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={() => setOpenTimePicker(true)}>
                <Icon name="clock" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.groupField]}>
            <Text style={[styles.fieldLabel]}>Bukti Sakit / Surat Dokter</Text>
            {image ? (
              <TouchableOpacity onPress={handleClickResetCamera} style={{ width: '100%', height: 45, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#242c40' }}>Reset Foto</Text>
                <Icon name="trash-alt" size={20} color="#000" style={{ position: 'absolute', right: 10 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleClickOpenCamera} style={{ width: '100%', height: 45, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#242c40' }}>Ambil Foto</Text>
                <Icon name="camera" size={20} color="#000" style={{ position: 'absolute', right: 10 }} />
              </TouchableOpacity>

            )}
            {image && (
              <View style={{ width: '100%', height: 200, marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
              </View>
            )}
          </View>
          <View style={[styles.groupField]}>
            <Text style={[styles.fieldLabel]}>Lokasi Absen Sakit</Text>
            <View style={{ width: '100%', height: 45, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10, justifyContent: 'center' }}>
              <TextInput
                style={{ color: '#242c40' }}
                placeholder="Lokasi Absen Sakit"
                value={data.location_check_in}
              // onChangeText={handleLocationChange}
              />
              <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={getCurrentLocation}>
                <Icon name="location-arrow" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            {data.latitude !== 0 && data.longitude !== 0 && (
              <MapView
                style={{ width: '100%', height: 200, marginBottom: 10, marginTop: -10 }}
                initialRegion={{
                  latitude: data.latitude,
                  longitude: data.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: data.latitude,
                    longitude: data.longitude,
                  }}
                  title="Lokasi Anda"
                  description={data.location_check_in}
                />
              </MapView>
            )}
          </View>
          <View style={[styles.groupField, { marginBottom: 10 }]}>
            <TouchableOpacity style={{ backgroundColor: '#242c40', padding: 10, borderRadius: 5, alignItems: 'center' }} onPress={handleSubmit}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Absen Sakit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <DatePicker
        modal
        mode="date"
        minimumDate={dayjs().hour(0).minute(0).second(0).toDate()}
        open={openDatePickerStartDate}
        date={data.start_date.toDate()}
        onConfirm={handleDateChangeStartDate}
        onCancel={() => setOpenDatePickerStartDate(false)}
      />
      <DatePicker
        modal
        mode="date"
        minimumDate={dayjs().hour(0).minute(0).second(0).toDate()}
        open={openDatePickerEndDate}
        date={data.end_date.toDate()}
        onConfirm={handleDateChangeEndDate}
        onCancel={() => setOpenDatePickerEndDate(false)}
      />
      <DatePicker
        modal
        mode="time"
        minimumDate={dayjs().toDate()}
        open={openTimePicker}
        date={data.time_check_in.toDate()}
        onConfirm={handleTimeChange}
        onCancel={() => setOpenTimePicker(false)}
      />
    </SafeAreaView>
  );
}

export default SakitScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  formContainer: {
    width: '90%',
    marginHorizontal: '5%',
  },
  groupField: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  fieldInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});