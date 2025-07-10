import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState({ roomName: '', capacity: '', status: '0' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (room.capacity <= 0) {
      setError('Sức chứa phải lớn hơn 0.');
      return;
    }

    if (!room.roomName.trim()) {
      setError('Tên phòng không được để trống.');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomName: room.roomName,
          capacity: parseInt(room.capacity),
          status: 0 // Fixed as Pending (0)
        }),
      });

      if (response.ok) {
        setMessage('✅ Tạo phòng thành công!');
        setTimeout(() => navigate('/room_management'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể tạo phòng.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi tạo phòng.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>➕ Create Room</h1>

      {error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <strong>Room Name:</strong>
          </label>
          <input
            type="text"
            name="roomName"
            value={room.roomName}
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
            <strong>Capacity:</strong>
          </label>
          <input
            type="number"
            name="capacity"
            value={room.capacity}
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
          Create Room
        </button>
        <button
          type="button"
          onClick={() => navigate('/room_management')}
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

export default CreateRoom;