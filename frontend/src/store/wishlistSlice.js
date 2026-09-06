import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWishlist, addToWishlist, removeFromWishlist } from '../util/groveApi';

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

export const addSpecimenToWishlist = createAsyncThunk(
  'wishlist/addSpecimenToWishlist',
  async (specimenId, { rejectWithValue }) => {
    try {
      await addToWishlist(specimenId);
      const res = await getWishlist();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeSpecimenFromWishlist = createAsyncThunk(
  'wishlist/removeSpecimenFromWishlist',
  async (specimenId, { rejectWithValue }) => {
    try {
      await removeFromWishlist(specimenId);
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
      .addCase(addSpecimenToWishlist.fulfilled, (state, action) => { state.items = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(addSpecimenToWishlist.rejected, (state, action) => { state.error = action.payload; })
      .addCase(removeSpecimenFromWishlist.fulfilled, (state, action) => { state.items = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(removeSpecimenFromWishlist.rejected, (state, action) => { state.error = action.payload; });
  },
});

export default wishlistSlice.reducer;
