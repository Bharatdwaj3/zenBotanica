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
// Loan routes
export const borrowBook = (data) => tendingApi.post('/loan', data);
export const issueLoan = (data) => tendingApi.post('/loan/issue', data);
export const returnBook = (id) => tendingApi.put(`/loan/${id}/return`);
export const getMyLoans = () => tendingApi.get('/loan/mine');
export const renewBook = (id) => tendingApi.put(`/loan/${id}/renew`);
export const getAllLoans = () => tendingApi.get('/loan');

// Fine routes
export const getMyFines = () => tendingApi.get('/fine/mine');
export const createPayOrder = (fineId) => tendingApi.post(`/fine/${fineId}/pay-order`);
export const verifyPayment = (data) => tendingApi.post(`/fine/verify-payment`, data);
export const createLoanFine = (loanId) => tendingApi.post(`/loan/${loanId}/create-fine`);
export const waiveLoanFine = (loanId) => tendingApi.patch(`/loan/${loanId}/waive-fine`);
