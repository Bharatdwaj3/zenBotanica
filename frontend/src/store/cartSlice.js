import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, addToCart, removeFromCart, checkoutCart } from '../util/catalogApi';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCart();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load cart');
    }
  }
);

export const addBookToCart = createAsyncThunk(
  'cart/addBookToCart',
  async (bookId, { rejectWithValue }) => {
    try {
      await addToCart(bookId);
      const res = await getCart();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const removeBookFromCart = createAsyncThunk(
  'cart/removeBookFromCart',
  async (bookId, { rejectWithValue }) => {
    try {
      await removeFromCart(bookId);
      const res = await getCart();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const checkout = createAsyncThunk(
  'cart/checkout',
  async (_, { rejectWithValue }) => {
    try {
      const res = await checkoutCart();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Checkout failed');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    checkoutResults: null,
    checkingOut: false,
  },
  reducers: {
    clearCheckoutResults: (state) => {
      state.checkoutResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBookToCart.fulfilled, (state, action) => { state.items = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(addBookToCart.rejected, (state, action) => { state.error = action.payload; })
      .addCase(removeBookFromCart.fulfilled, (state, action) => { state.items = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(removeBookFromCart.rejected, (state, action) => { state.error = action.payload; })
      .addCase(checkout.pending, (state) => { state.checkingOut = true; })
      .addCase(checkout.fulfilled, (state, action) => {
        state.checkingOut = false;
        state.checkoutResults = action.payload.results;
      })
      .addCase(checkout.rejected, (state, action) => {
        state.checkingOut = false;
        state.error = action.payload;
      });
  },
});

export const { clearCheckoutResults } = cartSlice.actions;
export default cartSlice.reducer;
