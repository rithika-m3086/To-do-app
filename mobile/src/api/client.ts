import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local Wi-Fi IPv4 address for physical devices and ADB reverse compatibility
// For physical phone: use 192.168.29.135:5000 or localhost:5000 (via adb reverse tcp:5000 tcp:5000)
// For Android Emulator: 10.0.2.2:5000 or localhost:5000
export const API_BASE_URL = 'http://192.168.29.135:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

client.interceptors.request.use(
  async (config) => {
    let token = authToken;
    if (!token) {
      token = await AsyncStorage.getItem('user_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
