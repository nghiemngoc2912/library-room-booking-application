import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const UpdateSlot = () => {
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId');
  const navigate = useNavigate();

  const [slot, setSlot] = useState({ id: '', order: '', fromTime: '', toTime: '', status: '1' });
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSlot = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://localhost:7238/api/Slot/update/${slotId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Không thể tải thông tin slot.');
        }
        const data = await response.json();
        setSlot({
          id: data.id,
          order: data.order,
          fromTime: data.fromTime,
          toTime: data.toTime,
          status: data.status.toString(),
        });
        setIsPending(data.status === 0);
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin slot.');
      } finally {
        setLoading(false);
      }
    };

    if (slotId) {
      fetchSlot();
    } else {
      setError('Không tìm thấy ID slot.');
      setLoading(false);
    }
  }, [slotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const order = parseInt(slot.order);
    if (isNaN(order) || order <= 0) {
      setError('Order phải là số nguyên lớn hơn 0.');
      return;
    }

    if (!slot.fromTime || !slot.toTime) {
      setError('Thời gian không được để trống.');
      return;
    }

    const fromTime = new Date(`1970-01-01T${slot.fromTime}:00`);
    const toTime = new Date(`1970-01-01T${slot.toTime}:00`);
    if (fromTime >= toTime) {
      setError('FromTime phải nhỏ hơn ToTime.');
      return;
    }

    // Status validation only for non-pending slots
    if (!isPending) {
      const status = parseInt(slot.status);
      if (![0, 1, -1, -2].includes(status)) {
        setError('Trạng thái không hợp lệ. Vui lòng chọn một giá trị hợp lệ.');
        return;
      }
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Slot/update/${slotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: slot.id,
          order: order,
          fromTime: slot.fromTime,
          toTime: slot.toTime,
          status: isPending ? 0 : parseInt(slot.status), // Keep status as 0 if pending
        }),
      });

      if (response.ok) {
        setMessage('✅ Cập nhật slot thành công!');
        setTimeout(() => navigate('/slot_management'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể cập nhật slot.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi cập nhật slot.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSlot((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>✏️ Update Slot</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Slot ID:</strong>
            </label>
            <input
              type="text"
              value={slot.id}
              disabled
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#f8f9fa',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Order:</strong>
            </label>
            <input
              type="number"
              name="order"
              value={slot.order}
              onChange={handleChange}
              required
              min="1"
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>From Time:</strong>
            </label>
            <input
              type="time"
              name="fromTime"
              value={slot.fromTime}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>To Time:</strong>
            </label>
            <input
              type="time"
              name="toTime"
              value={slot.toTime}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Status:</strong>
            </label>
            <select
              name="status"
              value={slot.status}
              onChange={handleChange}
              required
              disabled={isPending}
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: isPending ? '#f8f9fa' : 'white',
              }}
            >
              {/* <option value="0">Pending</option> */}
              <option value="1">Active</option>
              <option value="-1">Inactive</option>
              {/* <option value="-2">Maintenance</option> */}
            </select>
            {isPending && (
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Status cannot be changed while slot is pending.
              </p>
            )}
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem',
            }}
          >
            Update Slot
          </button>
          <button
            type="button"
            onClick={() => navigate('/slot_management')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem',
              marginTop: '0.5rem',
            }}
          >
            Cancel
          </button>
        </form>
      )}
      {message && (
        <p
          style={{
            marginTop: '1.5rem',
            color: message.startsWith('✅') ? 'green' : 'red',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UpdateSlot;