import axios from 'axios';
import { WeatherData, SearchHistoryItem, User, CitySuggestion } from '../types';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true // needed for Django CSRF protection
});

// Add request interceptor for authentication
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Weather API
export const getWeather = async (city: string): Promise<WeatherData> => {
  const response = await API.get(`/weather/?city=${city}`);
  return response.data;
};

// City Suggestions API 
export const getCitySuggestions = async (query: string): Promise<CitySuggestion[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await API.get(`/city-suggestions/?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
};

// Authentication API
export const login = async (username: string, password: string) => {
  const response = await API.post('/auth/login/', { username, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const response = await API.post('/auth/register/', { username, email, password });
  return response.data;
};

export const logout = async () => {
  const response = await API.post('/auth/logout/');
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await API.get('/auth/user/');
  return response.data;
};

// Search History API
export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  const response = await API.get('/history/');
  return response.data;
}; 