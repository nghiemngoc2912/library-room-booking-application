import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const UpdateRoom = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const navigate = useNavigate();

  const [room, setRoom] = useState({ id: '', roomName: '', capacity: '', status: '1' });
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://localhost:7238/api/Room/room_librarian/update_room/${roomId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Không thể tải thông tin phòng.');
        }
        const data = await response.json();
        setRoom({
          id: data.id,
          roomName: data.roomName,
          capacity: data.capacity,
          status: data.status.toString(),
        });
        setIsPending(data.status === 0);
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin phòng.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    } else {
      setError('Không tìm thấy ID phòng.');
      setLoading(false);
    }
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate capacity
    const capacity = parseInt(room.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      setError('Sức chứa phải lớn hơn 0.');
      return;
    }

    // Validate roomName
    if (!room.roomName.trim()) {
      setError('Tên phòng không được để trống.');
      return;
    }

    // Validate status
    const status = parseInt(room.status);
    const validStatuses = [0, 1, 2, 3]; // Match all enum values
    if (!validStatuses.includes(status)) {
      setError('Trạng thái không hợp lệ. Vui lòng chọn một giá trị hợp lệ.');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Room/room_librarian/update_room/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: room.id,
          roomName: room.roomName,
          capacity: capacity,
          status: status, // Use the validated status
        }),
      });

      if (response.ok) {
        setMessage('✅ Cập nhật phòng thành công!');
        setTimeout(() => navigate('/room_management'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể cập nhật phòng.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi cập nhật phòng.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>✏️ Update Room</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Room ID:</strong>
            </label>
            <input
              type="text"
              value={room.id}
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
            <select
              name="status"
              value={room.status}
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
              {/* <option value="2">Maintenance</option> */}
              <option value="3">Inactive</option>
            </select>
            {isPending && (
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Status cannot be changed while room is pending.
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
            Update Room
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

export default UpdateRoom;