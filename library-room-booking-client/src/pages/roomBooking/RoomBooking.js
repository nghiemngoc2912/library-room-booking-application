import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchSlotById } from '../../api/SlotAPI';
import { fetchRoomById } from '../../api/RoomAPI';
import bookingReasons from '../../constants/BookingReasons';

const RoomBooking = () => {
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('roomId');
  const slotId = searchParams.get('slotId');
  const date = searchParams.get('date');

  const [roomName, setRoomName] = useState('');
  const [slotInfo, setSlotInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roomData = await fetchRoomById(roomId);
        const slotInfo = await fetchSlotById(slotId);

        setRoomName(roomData?.roomName || 'Không rõ phòng');
        setSlotInfo(slotInfo?.order+" ("+slotInfo?.fromTime+" - "+slotInfo?.toTime+")" || 'Không rõ slot');
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu phòng hoặc ca.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId && slotId) {
      fetchData();
    }
  }, [roomId, slotId]);

  return (
    <div>
      <h1>Room Booking</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div><strong>Booking Date:</strong> {date}</div>
            <div><strong>Room:</strong> {roomName}</div>
            <div><strong>Slot:</strong> {slotInfo}</div>
          </div>
          <div>
            <label>Reason: </label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="" disabled>-- Choose Reason --</option>
              {bookingReasons.map((r, index) => (
                <option key={index} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomBooking;
