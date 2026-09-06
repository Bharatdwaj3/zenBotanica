import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNewArrivals, getTrending, getFeatured, getSpecimens } from '../util/groveApi';

export const fetchSpecimens = createAsyncThunk(
  'content/fetchSpecimens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { sortBy, selectedGenre, searchQuery } = getState().content;
      const isFiltering = selectedGenre !== 'all' || (searchQuery || '').trim() !== '';
      const res = isFiltering
        ? await getSpecimens()
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
  specimens: [],
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
      .addCase(fetchSpecimens.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchSpecimens.fulfilled, (state, action) => {
        state.loading = false;
        state.specimens = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSpecimens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setGenre, setSearchQuery, setSortBy } = contentSlice.actions;
export default contentSlice.reducer;
