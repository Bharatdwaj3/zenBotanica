import axios from 'axios';
import { store } from '../store/store';
import { clearUser } from '../store/avatarSlice';

const membersApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 8000,
});

membersApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await membersApi.post('/auth/refresh', {}, { _retry: true });
        return membersApi(originalRequest);
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

export default membersApi;

// Auth routes (beyond what api.js already handles)
export const registerUser = (data) => membersApi.post('/auth/register', data);
export const loginUser = (data) => membersApi.post('/auth/login', data);
export const logoutUser = () => membersApi.post('/auth/logout');
export const getProfile = () => membersApi.get('/auth/profile');
export const completeProfile = (data) => membersApi.post('/auth/profile', data);
export const updateUserRole = (data) => membersApi.put('/auth/role', data);
export const deleteUser = (id) => membersApi.delete(`/auth/user/${id}`);

// Faculty routes
export const getFacultyList = () => membersApi.get('/faculty');
export const addFaculty = (data) => membersApi.post('/faculty', data);
export const getFacultyById = (id) => membersApi.get(`/faculty/${id}`);
export const updateFacultyProfile = (id, data) => membersApi.put(`/faculty/profile/${id}`, data);
export const deleteFaculty = (id) => membersApi.delete(`/faculty/${id}`);

// Student routes
export const getStudentList = () => membersApi.get('/student');
export const getStudentProfile = (id) => membersApi.get(`/student/profile/${id}`);
export const addStudent = (data) => membersApi.post('/student', data);
export const updateStudentProfile = (id, data) => membersApi.put(`/student/profile/${id}`, data);
export const deleteStudent = (id) => membersApi.delete(`/student/profile/${id}`);
