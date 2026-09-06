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
        // Catalog can't refresh its own tokens — only Gardeners can.
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
// Specimen routes
export const getSpecimens = () => groveApi.get('/specimen');
export const getSpecimen = (id) => groveApi.get(`/specimen/${id}`);
export const addSpecimen = (data) => groveApi.post('/specimen', data);
export const updateSpecimen = (id, data) => groveApi.put(`/specimen/${id}`, data);
export const deleteSpecimen = (id) => groveApi.delete(`/specimen/${id}`);
export const adjustSpecimenCopies = (id, data) => groveApi.patch(`/specimen/${id}/copies`, data);
export const getNewArrivals = (limit = 10) => groveApi.get(`/specimen/new-arrivals?limit=${limit}`);
export const getSimilarSpecimens = (id) => groveApi.get(`/specimen/${id}/similar`);
export const getTrending = (limit = 10, days = 7) => groveApi.get(`/specimen/trending?limit=${limit}&days=${days}`);
export const getFeatured = () => groveApi.get('/specimen/featured');
export const setBulkFeatured = (data) => groveApi.patch('/specimen/bulk-featured', data);
export const setBulkWeeklyRead = (data) => groveApi.patch('/specimen/bulk-weekly-read', data);

// Storage routes
export const uploadFile = (formData) => groveApi.post('/storage/upload', formData, { timeout: 300000 });
export const extractPdf = (formData) => groveApi.post('/storage/extract', formData, { timeout: 300000 });
export const getFileUrl = (fileName) => groveApi.get(`/storage/file/${fileName}`);
export const listFiles = () => groveApi.get('/storage/files');
export const deleteFile = (fileName) => groveApi.delete(`/storage/file/${fileName}`);

// Cart routes
export const getCart = () => groveApi.get('/cart');
export const addToCart = (specimenId) => groveApi.post('/cart', { specimenId });
export const removeFromCart = (specimenId) => groveApi.delete(`/cart/${specimenId}`);
export const checkoutCart = () => groveApi.post('/cart/checkout');

// Wishlist routes
export const getWishlist = () => groveApi.get('/wishlist');
export const addToWishlist = (specimenId) => groveApi.post('/wishlist', { specimenId });
export const removeFromWishlist = (specimenId) => groveApi.delete(`/wishlist/${specimenId}`);
