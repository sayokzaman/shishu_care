import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function getBaseURL(): string {
  if (Platform.OS === 'web') return 'http://localhost:3000';
  // Expo Go / dev client: hostUri looks like "192.168.x.x:8082" — grab just the IP
  const hostUri = (Constants.expoConfig as any)?.hostUri ?? (Constants as any).manifest?.debuggerHost ?? '';
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost') return `http://${host}:3000`;
  }
  // Android emulator: 10.0.2.2 maps to host machine
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const sendRequest = async (url: string, method = 'GET', data = null, params = null) => {
  try {
    const response = await apiClient({ url, method, data, params });
    return response.data;
  } catch (error) {
    console.error(`API Error during ${method} request to ${url}:`, (error as AxiosError).message);

    if ((error as AxiosError).response) {
      const responseData = (error as AxiosError).response?.data as any;
      if (responseData?.errors?.length > 0) {
        const fieldErrors = (responseData.errors as { field?: string; message: string }[])
          .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
          .join('\n');
        throw new Error(fieldErrors);
      }
      throw new Error(responseData?.message || 'Server Error');
    } else if ((error as AxiosError).request) {
      throw new Error('No response received from server. Is Express running on port 3000?');
    } else {
      throw new Error((error as AxiosError).message);
    }
  }
};
