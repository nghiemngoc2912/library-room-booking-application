import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const DetailRequestRoom = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://localhost:7238/api/admin/pending_rooms/${roomId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Không thể tải thông tin phòng.');
        }
        const data = await response.json();
        setRoom(data);
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

  const handleAccept = async () => {
    try {
      const response = await fetch(`https://localhost:7238/api/admin/pending_rooms/accept/${roomId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        setMessage('✅ Phòng đã được chấp nhận!');
        setTimeout(() => navigate('/admin/request_room'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể chấp nhận phòng.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi chấp nhận phòng.');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối và xóa phòng này không?')) {
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/admin/pending_rooms/reject/${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setMessage('✅ Phòng đã bị từ chối và xóa!');
        setTimeout(() => navigate('/admin/request_room'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể từ chối phòng.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi từ chối phòng.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📋 Room Request Details</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : room ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <p style={{ fontSize: '1.1rem' }}>Bên phía thủ thư có một yêu cầu tạo phòng mới.</p>
          <p style={{ fontSize: '1.1rem' }}>
            Phòng có tên là <strong>{room.roomName}</strong> và có khả năng chứa được <strong>{room.capacity}</strong> người.
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Bạn có chấp nhận tạo phòng này không?</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={handleAccept}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                flex: 1,
                fontSize: '1rem',
              }}
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                flex: 1,
                fontSize: '1rem',
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>Không tìm thấy phòng.</p>
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

export default DetailRequestRoom;