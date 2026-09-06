import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchBooks, setGenre, setSortBy, setSearchQuery } from '../store/contentSlice';

export function useExploreBooks() {
  const dispatch = useDispatch();
  const { books, loading, error, selectedGenre, sortBy, searchQuery } = useSelector((state) => state.content);
  const [searchParams] = useSearchParams();

  // Picks up ?q= from the navbar search handoff once, on mount, into Redux —
  // searchQuery lives in Redux (not local state) so genre + search share one
  // "am I filtering?" check below.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) dispatch(setSearchQuery(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever a genre or search filter is active, fetchBooks (in contentSlice)
  // pulls the FULL catalog instead of just the current sort tab's top 20 —
  // fixes "genre/search outside the top-20 window shows no results."
  const isFiltering = selectedGenre !== 'all' || searchQuery.trim() !== '';

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch, sortBy, isFiltering]);

  const filteredBooks = books.filter((book) => {
    const matchesGenre = selectedGenre === 'all' || book.genre?.includes(selectedGenre);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || book.title?.toLowerCase().includes(q) || book.author?.toLowerCase().includes(q);
    return matchesGenre && matchesSearch;
  });

  return {
    filteredBooks,
    loading,
    error,
    selectedGenre,
    sortBy,
    searchQuery,
    setSearchQuery: (q) => dispatch(setSearchQuery(q)),
    setSelectedGenre: (genre) => dispatch(setGenre(genre)),
    setSortBy: (sort) => dispatch(setSortBy(sort)),
  };
}
