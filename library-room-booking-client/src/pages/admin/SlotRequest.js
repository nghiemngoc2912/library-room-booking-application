import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SlotRequest = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [slotsPerPage] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingSlots = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);

        const response = await fetch(`https://localhost:7238/api/admin/pending_slots?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể tải danh sách slot pending.');

        const data = await response.json();
        setSlots(data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách slot pending.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSlots();
  }, [searchTerm]);

  const filteredSlots = slots;

  const indexOfLastSlot = currentPage * slotsPerPage;
  const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
  const currentSlots = filteredSlots.slice(indexOfFirstSlot, indexOfLastSlot);
  const totalPages = Math.ceil(filteredSlots.length / slotsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDetail = (slotId) => {
    navigate(`/admin/request_slot/detail?slotId=${slotId}`);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📋 Pending Slot Requests</h1>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by order..."
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
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Slot ID</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Order</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>From Time</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>To Time</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSlots.map((slot) => (
                <tr key={slot.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{slot.id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{slot.order}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{slot.fromTime}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{slot.toTime}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{slot.status}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleDetail(slot.id)}
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

export default SlotRequest;