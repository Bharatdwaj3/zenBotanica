import { useEffect, useState } from 'react';
import { getMastersList, getApprenticeList } from '../util/gardenersApi';

// Loads the masters/apprentice directory once, only when isAdmin is true.
// Used by TendingsSection's curator view to build the gardener roster table.
export const useGardenerDirectory = (isAdmin) => {
  const [masterList, setMastersList] = useState([]);
  const [apprenticeList, setApprenticeList] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(isAdmin);

  useEffect(() => {
    if (!isAdmin) return;
    const loadDirectory = async () => {
      setDirectoryLoading(true);
      try {
        const [mastersRes, apprenticeRes] = await Promise.all([getMastersList(), getApprenticeList()]);
        setMastersList(mastersRes.data);
        setApprenticeList(apprenticeRes.data);
      } catch {
      } finally {
        setDirectoryLoading(false);
      }
    };
    loadDirectory();
  }, [isAdmin]);

  return { masterList, apprenticeList, directoryLoading };
};
