import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudents } from '../../api/UserAPI';

const StudentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchStudents(searchTerm, page, pageSize);
        setStudents(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    loadStudents();
  }, [searchTerm, page]);

  return (
    <div style={{
      maxWidth: 1000,
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #eee',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Student List</h1>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by code, name, email"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '300px',
            fontSize: '1rem'
          }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={th}>Student Name</th>
            <th style={th}>Code</th>
            <th style={th}>Email</th>
            <th style={th}>Status</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td style={td}>{student.fullName}</td>
              <td style={td}>{student.code}</td>
              <td style={td}>{student.email}</td>
              <td style={td}>{student.status }</td>
              <td style={td}>
                <Link to={`/student/profile?userId=${student.id}`}>
                  <button
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    Detail
                  </button>
                </Link>
                <button
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  View History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            style={{
              backgroundColor: page === pageNum ? '#007bff' : '#f8f9fa',
              color: page === pageNum ? 'white' : 'black',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              cursor: 'pointer'
            }}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
};

const th = {
  padding: '0.75rem',
  border: '1px solid #dee2e6',
  textAlign: 'left'
};

const td = {
  padding: '0.75rem',
  border: '1px solid #dee2e6'
};

export default StudentListPage;