import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWishlist, addToWishlist, removeFromWishlist } from '../util/catalogApi';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getWishlist();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load wishlist');
    }
  }
);

export const addBookToWishlist = createAsyncThunk(
  'wishlist/addBookToWishlist',
  async (bookId, { rejectWithValue }) => {
    try {
      await addToWishlist(bookId);
      const res = await getWishlist();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeBookFromWishlist = createAsyncThunk(
  'wishlist/removeBookFromWishlist',
  async (bookId, { rejectWithValue }) => {
    try {
      await removeFromWishlist(bookId);
      const res = await getWishlist();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBookToWishlist.fulfilled, (state, action) => { state.items = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(addBookToWishlist.rejected, (state, action) => { state.error = action.payload; })
      .addCase(removeBookFromWishlist.fulfilled, (state, action) => { state.items = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(removeBookFromWishlist.rejected, (state, action) => { state.error = action.payload; });
  },
});

export default wishlistSlice.reducer;
