import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListRoom = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== '') params.append('status', statusFilter);

        const response = await fetch(`https://localhost:7238/api/Room/room_librarian/filter?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể tải danh sách phòng.');

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách phòng.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [searchTerm, statusFilter]);

  const filteredRooms = rooms;

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleUpdate = (roomId) => {
    navigate(`/room_management/update?roomId=${roomId}`);
  };

  const handleCreate = () => {
    navigate('/room_management/create');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🏠 Room Management</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleCreate}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Add New Room
          </button>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setCurrentPage(1);
                setStatusFilter(e.target.value);
              }}
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                width: '200px',
                boxSizing: 'border-box',
                fontSize: '1rem',
              }}
            >
              <option value="">All</option>
              <option value="0">Pending</option>
              <option value="1">Active</option>
              <option value="3">Inactive</option>
              <option value="2">Maintenance</option>
            </select>
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by room name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Capacity</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room) => (
                <tr key={room.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{room.id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{room.roomName}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    {room.status === 1 ? 'Active' : room.status === 0 ? 'Pending' : room.status === 3 ? 'Inactive' : 'Maintenance'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{room.capacity}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleUpdate(room.id)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '0.5rem',
                      }}
                    >
                      Update
                    </button>

                    {(room.status === 1 || room.status === 2) && (
                      <button
                        onClick={() => navigate(`/room_management/maintenance?roomId=${room.id}`)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Đặt lịch bảo trì
                      </button>
                    )}
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

export default ListRoom;