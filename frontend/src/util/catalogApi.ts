import axios from 'axios';
import gardenersApi from './gardenersApi';

const groveApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 8000,
});

groveApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Catalog can't refresh its own tokens — only Members can.
        await gardenersApi.post('/auth/refresh');
        return groveApi(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default groveApi;
// Book routes
export const getBooks = () => groveApi.get('/book');
export const getBook = (id) => groveApi.get(`/book/${id}`);
export const addBook = (data) => groveApi.post('/book', data);
export const updateBook = (id, data) => groveApi.put(`/book/${id}`, data);
export const deleteBook = (id) => groveApi.delete(`/book/${id}`);
export const adjustBookCopies = (id, data) => groveApi.patch(`/book/${id}/copies`, data);
export const getNewArrivals = (limit = 10) => groveApi.get(`/book/new-arrivals?limit=${limit}`);
export const getSimilarBooks = (id) => groveApi.get(`/book/${id}/similar`);
export const getTrending = (limit = 10, days = 7) => groveApi.get(`/book/trending?limit=${limit}&days=${days}`);
export const getFeatured = () => groveApi.get('/book/featured');
export const setBulkFeatured = (data) => groveApi.patch('/book/bulk-featured', data);
export const setBulkWeeklyRead = (data) => groveApi.patch('/book/bulk-weekly-read', data);

// Storage routes
export const uploadFile = (formData) => groveApi.post('/storage/upload', formData, { timeout: 300000 });
export const extractPdf = (formData) => groveApi.post('/storage/extract', formData, { timeout: 300000 });
export const getFileUrl = (fileName) => groveApi.get(`/storage/file/${fileName}`);
export const listFiles = () => groveApi.get('/storage/files');
export const deleteFile = (fileName) => groveApi.delete(`/storage/file/${fileName}`);

// Cart routes
export const getCart = () => groveApi.get('/cart');
export const addToCart = (bookId) => groveApi.post('/cart', { bookId });
export const removeFromCart = (bookId) => groveApi.delete(`/cart/${bookId}`);
export const checkoutCart = () => groveApi.post('/cart/checkout');

// Wishlist routes
export const getWishlist = () => groveApi.get('/wishlist');
export const addToWishlist = (bookId) => groveApi.post('/wishlist', { bookId });
export const removeFromWishlist = (bookId) => groveApi.delete(`/wishlist/${bookId}`);
