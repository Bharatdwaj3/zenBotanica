import axios from 'axios';
import membersApi from './membersApi';

const circulationApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 8000,
});

circulationApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await membersApi.post('/auth/refresh');
        return circulationApi(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default circulationApi;
// Loan routes
export const borrowBook = (data) => circulationApi.post('/loan', data);
export const issueLoan = (data) => circulationApi.post('/loan/issue', data);
export const returnBook = (id) => circulationApi.put(`/loan/${id}/return`);
export const getMyLoans = () => circulationApi.get('/loan/mine');
export const renewBook = (id) => circulationApi.put(`/loan/${id}/renew`);
export const getAllLoans = () => circulationApi.get('/loan');

// Fine routes
export const getMyFines = () => circulationApi.get('/fine/mine');
export const createPayOrder = (fineId) => circulationApi.post(`/fine/${fineId}/pay-order`);
export const verifyPayment = (data) => circulationApi.post(`/fine/verify-payment`, data);
export const createLoanFine = (loanId) => circulationApi.post(`/loan/${loanId}/create-fine`);
export const waiveLoanFine = (loanId) => circulationApi.patch(`/loan/${loanId}/waive-fine`);
