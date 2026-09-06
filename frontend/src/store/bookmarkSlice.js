import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'bookmarks';

// Reads whatever was saved last time, so bookmarks survive a page refresh.
// Falls back to an empty array if nothing's saved yet, or if the saved value is corrupted.
const loadBookmarks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveBookmarks = (books) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
};

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState: {
    books: loadBookmarks(),
  },
  reducers: {
    // Adds if not already bookmarked, removes if it is — one action for a bookmark button's onClick.
    toggleBookmark: (state, action) => {
      const book = action.payload;
      const alreadyBookmarked = state.books.some((b) => b.id === book.id);

      state.books = alreadyBookmarked
        ? state.books.filter((b) => b.id !== book.id)
        : [...state.books, book];

      saveBookmarks(state.books);
    },
    removeBookmark: (state, action) => {
      const bookId = action.payload;
      state.books = state.books.filter((b) => b.id !== bookId);
      saveBookmarks(state.books);
    },
    clearBookmarks: (state) => {
      state.books = [];
      saveBookmarks(state.books);
    },
  },
});

export const { toggleBookmark, removeBookmark, clearBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
