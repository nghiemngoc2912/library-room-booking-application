import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const DetailSlotRequest = () => {
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId');
  const navigate = useNavigate();

  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSlot = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://localhost:7238/api/admin/pending_slots/${slotId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Không thể tải thông tin slot.');
        }
        const data = await response.json();
        setSlot(data);
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

  const handleAccept = async () => {
    try {
      const response = await fetch(`https://localhost:7238/api/admin/pending_slots/accept/${slotId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        setMessage('✅ Slot đã được chấp nhận!');
        setTimeout(() => navigate('/admin/request_slot'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể chấp nhận slot.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi chấp nhận slot.');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối và xóa slot này không?')) {
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/admin/pending_slots/reject/${slotId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setMessage('✅ Slot đã bị từ chối và xóa!');
        setTimeout(() => navigate('/admin/request_slot'), 2000);
      } else {
        const errorText = await response.text();
        setError(`❌ Lỗi: ${errorText || 'Không thể từ chối slot.'}`);
      }
    } catch (err) {
      console.error(err);
      setError('❌ Lỗi hệ thống khi từ chối slot.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📋 Slot Request Details</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : slot ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <p style={{ fontSize: '1.1rem' }}>Bên phía thủ thư có một yêu cầu tạo slot mới.</p>
          <p style={{ fontSize: '1.1rem' }}>
            Slot có thứ tự là <strong>{slot.order}</strong> từ <strong>{slot.fromTime}</strong> đến <strong>{slot.toTime}</strong>.
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Bạn có chấp nhận tạo slot này không?</p>
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
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>Không tìm thấy slot.</p>
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

export default DetailSlotRequest;