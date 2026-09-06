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

// Faculty routes
export const getFacultyList = () => gardenersApi.get('/faculty');
export const addFaculty = (data) => gardenersApi.post('/faculty', data);
export const getFacultyById = (id) => gardenersApi.get(`/faculty/${id}`);
export const updateFacultyProfile = (id, data) => gardenersApi.put(`/faculty/profile/${id}`, data);
export const deleteFaculty = (id) => gardenersApi.delete(`/faculty/${id}`);

// Student routes
export const getStudentList = () => gardenersApi.get('/student');
export const getStudentProfile = (id) => gardenersApi.get(`/student/profile/${id}`);
export const addStudent = (data) => gardenersApi.post('/student', data);
export const updateStudentProfile = (id, data) => gardenersApi.put(`/student/profile/${id}`, data);
export const deleteStudent = (id) => gardenersApi.delete(`/student/profile/${id}`);
