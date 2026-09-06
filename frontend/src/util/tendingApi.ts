import axios from 'axios';
import gardenersApi from './gardenersApi';

const tendingApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 8000,
});

tendingApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await gardenersApi.post('/auth/refresh');
        return tendingApi(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default tendingApi;
// Tending routes
export const borrowSpecimen = (data) => tendingApi.post('/tending', data);
export const issueTending = (data) => tendingApi.post('/tending/issue', data);
export const returnSpecimen = (id) => tendingApi.put(`/tending/${id}/return`);
export const getMyTendings = () => tendingApi.get('/tending/mine');
export const renewSpecimen = (id) => tendingApi.put(`/tending/${id}/renew`);
export const getAllTendings = () => tendingApi.get('/tending');

// Penalty routes
export const getMyPenalties = () => tendingApi.get('/penalty/mine');
export const createPayOrder = (penaltyId) => tendingApi.post(`/penalty/${penaltyId}/pay-order`);
export const verifyPayment = (data) => tendingApi.post(`/penalty/verify-payment`, data);
export const createTendingPenalty = (tendingId) => tendingApi.post(`/tending/${tendingId}/create-penalty`);
export const waiveTendingPenalty = (tendingId) => tendingApi.patch(`/tending/${tendingId}/waive-penalty`);
