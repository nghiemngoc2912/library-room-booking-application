import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListSlot = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [slotsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== '') params.append('status', statusFilter);

        const response = await fetch(`https://localhost:7238/api/Slot/filter?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Không thể tải danh sách slot.');

        const data = await response.json();
        setSlots(data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách slot.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [searchTerm, statusFilter]);

  const filteredSlots = slots;

  const indexOfLastSlot = currentPage * slotsPerPage;
  const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
  const currentSlots = filteredSlots.slice(indexOfFirstSlot, indexOfLastSlot);
  const totalPages = Math.ceil(filteredSlots.length / slotsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreate = () => {
    navigate('/slot_management/create');
  };

  const handleUpdate = (slotId) => {
    navigate(`/slot_management/update?slotId=${slotId}`);
  };

  const handleDeactivate = async (slotId) => {
    if (!window.confirm('Bạn có chắc chắn muốn deactive slot này không?')) {
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Slot/deactivate/${slotId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        setSlots(slots.map(slot => 
          slot.id === slotId ? { ...slot, status: -1 } : slot
        ));
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể deactive slot.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi deactive slot.');
    }
  };

  const handleActivate = async (slotId) => {
    if (!window.confirm('Bạn có chắc chắn muốn activate slot này không?')) {
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Slot/activate/${slotId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        setSlots(slots.map(slot => 
          slot.id === slotId ? { ...slot, status: 1 } : slot
        ));
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể activate slot.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi activate slot.');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>⏰ Slot Management</h1>

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
            Add New Slot
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
              <option value="-1">Inactive</option>
              <option value="-2">Maintenance</option>
            </select>
          </div>
        </div>
        <div>
          <input
            type="number"
            placeholder="Search by order..."
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
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    {slot.status === 1 ? 'Active' : slot.status === 0 ? 'Pending' : slot.status === -1 ? 'Inactive' : 'Maintenance'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleUpdate(slot.id)}
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
                      Edit
                    </button>
                    {slot.status === 1 && (
                      <button
                        onClick={() => handleDeactivate(slot.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          marginRight: '0.5rem',
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                    {slot.status === -1 && (
                      <button
                        onClick={() => handleActivate(slot.id)}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Activate
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

export default ListSlot;