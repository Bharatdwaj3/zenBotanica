import axios from 'axios';
import membersApi from './membersApi';

const catalogApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 8000,
});

catalogApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Catalog can't refresh its own tokens — only Members can.
        await membersApi.post('/auth/refresh');
        return catalogApi(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default catalogApi;
// Book routes
export const getBooks = () => catalogApi.get('/book');
export const getBook = (id) => catalogApi.get(`/book/${id}`);
export const addBook = (data) => catalogApi.post('/book', data);
export const updateBook = (id, data) => catalogApi.put(`/book/${id}`, data);
export const deleteBook = (id) => catalogApi.delete(`/book/${id}`);
export const adjustBookCopies = (id, data) => catalogApi.patch(`/book/${id}/copies`, data);
export const getNewArrivals = (limit = 10) => catalogApi.get(`/book/new-arrivals?limit=${limit}`);
export const getSimilarBooks = (id) => catalogApi.get(`/book/${id}/similar`);
export const getTrending = (limit = 10, days = 7) => catalogApi.get(`/book/trending?limit=${limit}&days=${days}`);
export const getFeatured = () => catalogApi.get('/book/featured');
export const setBulkFeatured = (data) => catalogApi.patch('/book/bulk-featured', data);
export const setBulkWeeklyRead = (data) => catalogApi.patch('/book/bulk-weekly-read', data);

// Storage routes
export const uploadFile = (formData) => catalogApi.post('/storage/upload', formData, { timeout: 300000 });
export const extractPdf = (formData) => catalogApi.post('/storage/extract', formData, { timeout: 300000 });
export const getFileUrl = (fileName) => catalogApi.get(`/storage/file/${fileName}`);
export const listFiles = () => catalogApi.get('/storage/files');
export const deleteFile = (fileName) => catalogApi.delete(`/storage/file/${fileName}`);

// Cart routes
export const getCart = () => catalogApi.get('/cart');
export const addToCart = (bookId) => catalogApi.post('/cart', { bookId });
export const removeFromCart = (bookId) => catalogApi.delete(`/cart/${bookId}`);
export const checkoutCart = () => catalogApi.post('/cart/checkout');

// Wishlist routes
export const getWishlist = () => catalogApi.get('/wishlist');
export const addToWishlist = (bookId) => catalogApi.post('/wishlist', { bookId });
export const removeFromWishlist = (bookId) => catalogApi.delete(`/wishlist/${bookId}`);
