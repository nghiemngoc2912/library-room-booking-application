import React from 'react';
import DatePicker from '../../Components/date/BookingDatePicker';
import BookingTable from '../../Components/table/BookingTable';
import { useState } from 'react';
export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => {
    // Mặc định là hôm nay
    return new Date().toISOString().split('T')[0];
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Room Booking</h2>

      <div style={{ marginBottom: 20 }}>
        <DatePicker
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <BookingTable date={selectedDate} status={[1, 2, 0]} />
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '6px 12px',
                borderRadius: 4,
                marginRight: 8,
                minWidth: 60,
                textAlign: 'center'
              }}>+</span>
              <span>Phòng trống</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '6px 12px',
                borderRadius: 4,
                marginRight: 8,
                minWidth: 60,
                textAlign: 'center'
              }}>Đã đặt</span>
              <span>Phòng đã được đặt</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                backgroundColor: '#e0e0e0',
                color: '#6c757d',
                padding: '6px 12px',
                borderRadius: 4,
                marginRight: 8,
                minWidth: 60,
                textAlign: 'center'
              }}>-</span>
              <span>Phòng đang bảo trì</span>
            </div>
          </div>
        </div>
    </div>
  );
}
