import axios from 'axios';
import { store } from '../store/store';
import { clearUser } from '../store/avatarSlice';

const gardenersApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 8000,
});

gardenersApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await gardenersApi.post('/auth/refresh', {}, { _retry: true });
        return gardenersApi(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearUser());
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default gardenersApi;

// Auth routes (beyond what api.js already handles)
export const registerUser = (data) => gardenersApi.post('/auth/register', data);
export const loginUser = (data) => gardenersApi.post('/auth/login', data);
export const logoutUser = () => gardenersApi.post('/auth/logout');
export const getProfile = () => gardenersApi.get('/auth/profile');
export const completeProfile = (data) => gardenersApi.post('/auth/profile', data);
export const updateUserRole = (data) => gardenersApi.put('/auth/role', data);
export const deleteUser = (id) => gardenersApi.delete(`/auth/user/${id}`);

// Masters routes
export const getMastersList = () => gardenersApi.get('/masters');
export const addMasters = (data) => gardenersApi.post('/masters', data);
export const getMastersById = (id) => gardenersApi.get(`/masters/${id}`);
export const updateMastersProfile = (id, data) => gardenersApi.put(`/masters/profile/${id}`, data);
export const deleteMasters = (id) => gardenersApi.delete(`/masters/${id}`);

// Apprentice routes
export const getApprenticeList = () => gardenersApi.get('/apprentice');
export const getApprenticeProfile = (id) => gardenersApi.get(`/apprentice/profile/${id}`);
export const addApprentice = (data) => gardenersApi.post('/apprentice', data);
export const updateApprenticeProfile = (id, data) => gardenersApi.put(`/apprentice/profile/${id}`, data);
export const deleteApprentice = (id) => gardenersApi.delete(`/apprentice/profile/${id}`);
