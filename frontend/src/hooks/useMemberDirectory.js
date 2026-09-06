import { useEffect, useState } from 'react';
import { getFacultyList, getStudentList } from '../util/membersApi';

// Loads the faculty/student directory once, only when isAdmin is true.
// Used by LoansSection's admin view to build the member roster table.
export const useMemberDirectory = (isAdmin) => {
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(isAdmin);

  useEffect(() => {
    if (!isAdmin) return;
    const loadDirectory = async () => {
      setDirectoryLoading(true);
      try {
        const [facultyRes, studentRes] = await Promise.all([getFacultyList(), getStudentList()]);
        setFacultyList(facultyRes.data);
        setStudentList(studentRes.data);
      } catch {
      } finally {
        setDirectoryLoading(false);
      }
    };
    loadDirectory();
  }, [isAdmin]);

  return { facultyList, studentList, directoryLoading };
};
