import { useEffect, useState } from 'react';
import { getSpecimens, setBulkFeatured, setBulkWeeklyRead } from '../util/groveApi';

export function useSpecimens({ enabled = true } = {}) {
  const [specimenList, setSpecimenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSpecimenIds, setSelectedSpecimenIds] = useState(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);

  const fetchSpecimens = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getSpecimens();
      setSpecimenList(data);
    } catch (err) {
      setError(err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    fetchSpecimens();
  }, [enabled]);

  const toggleSpecimenSelection = (id) => {
    setSelectedSpecimenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkFeatured = async (featured) => {
    if (selectedSpecimenIds.size === 0) return;
    setBulkSaving(true);
    setError('');
    try {
      await setBulkFeatured({ ids: Array.from(selectedSpecimenIds), featured });
      await fetchSpecimens();
      setSelectedSpecimenIds(new Set());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update featured status');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleBulkWeeklyRead = async (weeklyRead) => {
    if (selectedSpecimenIds.size === 0) return;
    setBulkSaving(true);
    setError('');
    try {
      await setBulkWeeklyRead({ ids: Array.from(selectedSpecimenIds), weeklyRead });
      await fetchSpecimens();
      setSelectedSpecimenIds(new Set());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update weekly read status');
    } finally {
      setBulkSaving(false);
    }
  };

  const toggleFeatured = async (specimen) => {
    setError('');
    try {
      await setBulkFeatured({ ids: [specimen.id], featured: !specimen.featured });
      await fetchSpecimens();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update featured status');
    }
  };

  const toggleWeeklyRead = async (specimen) => {
    setError('');
    try {
      await setBulkWeeklyRead({ ids: [specimen.id], weeklyRead: !specimen.weeklyRead });
      await fetchSpecimens();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update weekly read status');
    }
  };

  return {
    specimenList,
    loading,
    error,
    selectedSpecimenIds,
    bulkSaving,
    toggleSpecimenSelection,
    handleBulkFeatured,
    handleBulkWeeklyRead,
    toggleFeatured,
    toggleWeeklyRead,
    refetch: fetchSpecimens,
  };
}
