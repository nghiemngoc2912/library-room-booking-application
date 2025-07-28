import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MaintenanceBooking = () => {
  const navigate = useNavigate();
  const location = new URLSearchParams(useLocation().search);
  const roomId = location.get('roomId');
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [useRange, setUseRange] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch('https://localhost:7238/api/Slot/slots_for_maintenance', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Không thể tải danh sách slot.');
        const data = await response.json();
        setSlots(data);
      } catch (err) {
        setError('Không thể tải danh sách slot.');
      }
    };
    fetchSlots();
  }, []);

  const handleSubmit = async () => {
    if (!selectedDate && !useRange) {
      setError('Vui lòng chọn ngày bảo trì.');
      return;
    }
    if (!selectedSlot) {
      setError('Vui lòng chọn slot bảo trì.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roomId: parseInt(roomId),
        slotId: parseInt(selectedSlot),
        reason,
        bookingDate: selectedDate,
        dateRange: useRange ? { from: dateRange.from, to: dateRange.to } : null,
      };

      const response = await fetch('https://localhost:7238/api/Booking/maintenance', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể tạo lịch bảo trì.');
      }
      const data = await response.json();
      setMessage(data.message || 'Đặt lịch bảo trì thành công!');
      setTimeout(() => navigate('/room_management'), 2000);
    } catch (err) {
      setError(err.message || 'Đặt lịch bảo trì thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px' }}>
      <h2>Đặt lịch bảo trì cho phòng {roomId}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={useRange}
            onChange={() => setUseRange(!useRange)}
          />
          Chọn khoảng ngày
        </label>
      </div>

      {!useRange ? (
        <div style={{ marginBottom: '1rem' }}>
          <label>Chọn ngày bảo trì:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </div>
      ) : (
        <div style={{ marginBottom: '1rem' }}>
          <label>Từ ngày:</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            style={{ padding: '0.5rem', width: '100%' }}
          />
          <label>Đến ngày:</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label>Chọn slot bảo trì:</label>
        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
          style={{ padding: '0.5rem', width: '100%' }}
        >
          <option value="">Chọn slot</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.fromTime} - {slot.toTime} {slot.status === 4 ? '(Chỉ dành cho bảo trì)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Lý do bảo trì:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', minHeight: '100px' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '0.75rem',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch bảo trì'}
      </button>
    </div>
  );
};

export default MaintenanceBooking;