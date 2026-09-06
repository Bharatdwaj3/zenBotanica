import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'specimenmarks';

// Reads whatever was saved last time, so specimenmarks survive a page refresh.
// Falls back to an empty array if nothing's saved yet, or if the saved value is corrupted.
const loadBookmarks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveBookmarks = (specimens) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(specimens));
};

const specimenmarkSlice = createSlice({
  name: 'specimenmark',
  initialState: {
    specimens: loadBookmarks(),
  },
  reducers: {
    // Adds if not already specimenmarked, removes if it is — one action for a specimenmark button's onClick.
    toggleBookmark: (state, action) => {
      const specimen = action.payload;
      const alreadyBookmarked = state.specimens.some((b) => b.id === specimen.id);

      state.specimens = alreadyBookmarked
        ? state.specimens.filter((b) => b.id !== specimen.id)
        : [...state.specimens, specimen];

      saveBookmarks(state.specimens);
    },
    removeBookmark: (state, action) => {
      const specimenId = action.payload;
      state.specimens = state.specimens.filter((b) => b.id !== specimenId);
      saveBookmarks(state.specimens);
    },
    clearBookmarks: (state) => {
      state.specimens = [];
      saveBookmarks(state.specimens);
    },
  },
});

export const { toggleBookmark, removeBookmark, clearBookmarks } = specimenmarkSlice.actions;
export default specimenmarkSlice.reducer;
