import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// =============================================================================
// BACKEND API BASE URL CONFIGURATION
// =============================================================================
// - Android Emulator (mặc định): http://10.0.2.2:5000
// - iOS Simulator (mặc định): http://localhost:5000
// - Máy thật cắm cáp USB (khuyên dùng): Chạy lệnh `adb reverse tcp:5000 tcp:5000`,
//   sau đó đặt API_BASE_URL = 'http://localhost:5000'
// - Máy thật qua Wi-Fi LAN: Đặt API_BASE_URL = 'http://<IP_MAY_TINH_CUA_BAN>:5000' (VD: http://192.168.1.50:5000)
// - Server Cloud (Render/Railway): Đặt API_BASE_URL = 'https://your-backend.onrender.com'
// =============================================================================

const OVERRIDE_CUSTOM_URL: string | null = null; // Gán URL tại đây nếu test máy thật Wi-Fi hoặc Cloud

export const API_BASE_URL =
  OVERRIDE_CUSTOM_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Access Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@cupid_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || 'Lỗi kết nối máy chủ';
    return Promise.reject(new Error(message));
  }
);
