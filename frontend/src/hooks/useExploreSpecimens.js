import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchSpecimens, setGenre, setSortBy, setSearchQuery } from '../store/contentSlice';

export function useExploreSpecimens() {
  const dispatch = useDispatch();
  const { specimens, loading, error, selectedGenre, sortBy, searchQuery } = useSelector((state) => state.content);
  const [searchParams] = useSearchParams();

  // Picks up ?q= from the navbar search handoff once, on mount, into Redux —
  // searchQuery lives in Redux (not local state) so genre + search share one
  // "am I filtering?" check below.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) dispatch(setSearchQuery(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever a genre or search filter is active, fetchSpecimens (in contentSlice)
  // pulls the FULL grove instead of just the current sort tab's top 20 —
  // fixes "genre/search outside the top-20 window shows no results."
  const isFiltering = selectedGenre !== 'all' || searchQuery.trim() !== '';

  useEffect(() => {
    dispatch(fetchSpecimens());
  }, [dispatch, sortBy, isFiltering]);

  const filteredSpecimens = specimens.filter((specimen) => {
    const matchesGenre = selectedGenre === 'all' || specimen.genre?.includes(selectedGenre);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || specimen.title?.toLowerCase().includes(q) || specimen.author?.toLowerCase().includes(q);
    return matchesGenre && matchesSearch;
  });

  return {
    filteredSpecimens,
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
