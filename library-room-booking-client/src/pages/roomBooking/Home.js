import React from 'react';
import DatePicker from '../../components/date/BookingDatePicker';
import BookingTable from '../../components/table/BookingTable';
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

      <BookingTable date={selectedDate} status={0} />
    </div>
  );
}
