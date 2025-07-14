import React, { useEffect, useState } from 'react';
import SearchBar from '../../Components/SearchBar';
import StudentTable from '../../Components/StudentTable';
import Pagination from '../../Components/Pagination';
import { fetchStudents } from '../../api/UserAPI'; // import hàm fetch

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadStudents();
  }, [searchTerm, page]);

  const loadStudents = async () => {
    try {
      const data = await fetchStudents(searchTerm, page, pageSize);
      setStudents(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Student List</h2>
      <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
      <StudentTable students={students} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default StudentList;
