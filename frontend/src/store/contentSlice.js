import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNewArrivals, getTrending, getFeatured, getBooks } from '../util/catalogApi';

export const fetchBooks = createAsyncThunk(
  'content/fetchBooks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { sortBy, selectedGenre, searchQuery } = getState().content;
      const isFiltering = selectedGenre !== 'all' || (searchQuery || '').trim() !== '';
      const res = isFiltering
        ? await getBooks()
        : sortBy === 'trending' ? await getTrending(20)
        : sortBy === 'featured' ? await getFeatured()
        : await getNewArrivals(20);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response ? 'Something went wrong on our end.' : "Can't reach the server — check your network."
      );
    }
  }
);

const initialState = {
  selectedGenre: 'all',
  searchQuery: '',
  sortBy: 'recent',
  books: [],
  loading: false,
  error: '',
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setGenre: (state, action) => {
      state.selectedGenre = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setGenre, setSearchQuery, setSortBy } = contentSlice.actions;
export default contentSlice.reducer;
