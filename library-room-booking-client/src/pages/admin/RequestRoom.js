import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RequestRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingRooms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);

        const response = await fetch(`https://localhost:7238/api/Admin/pending_rooms?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể tải danh sách phòng pending.');

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách phòng pending.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRooms();
  }, [searchTerm]);

  const filteredRooms = rooms;

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDetail = (roomId) => {
    navigate(`/admin/request_room/detail?roomId=${roomId}`);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📋 Pending Room Requests</h1>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by room name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '200px',
            boxSizing: 'border-box',
            fontSize: '1rem',
          }}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Room ID</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Room Name</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Capacity</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room) => (
                <tr key={room.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{room.id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{room.roomName}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{room.capacity}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{room.status}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleDetail(room.id)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                style={{
                  backgroundColor: currentPage === page ? '#007bff' : '#f8f9fa',
                  color: currentPage === page ? 'white' : 'black',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  cursor: 'pointer',
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RequestRoom;