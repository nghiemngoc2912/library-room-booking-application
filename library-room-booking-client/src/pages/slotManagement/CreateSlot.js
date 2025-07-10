import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateSlot = () => {
  const navigate = useNavigate();
  const [slot, setSlot] = useState({ order: '', fromTime: '', toTime: '', status: '0' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

    try {
      const response = await fetch(`https://localhost:7238/api/Slot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          order: order,
          fromTime: slot.fromTime,
          toTime: slot.toTime,
          status: 0 // Pending
        }),
      });

      if (response.ok) {
        setMessage('✅ Tạo slot thành công!');
        setTimeout(() => navigate('/slot_management'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể tạo slot.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi tạo slot.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSlot((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>➕ Create Slot</h1>

      {error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
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
          <input
            type="text"
            value="Pending"
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
        <button
          type="submit"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            fontSize: '1rem',
          }}
        >
          Create Slot
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

export default CreateSlot;