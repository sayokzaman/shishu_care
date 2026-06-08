import axios, { AxiosError } from 'axios';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
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
      throw new Error(((error as AxiosError).response?.data as any)?.message || 'Server Error');
    } else if ((error as AxiosError).request) {
      throw new Error('No response received from server. Is Express running on port 3000?');
    } else {
      throw new Error((error as AxiosError).message);
    }
  }
};
