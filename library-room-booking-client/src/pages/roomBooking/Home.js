import React, { useState } from 'react';
import DatePicker from '../../Components/date/BookingDatePicker';
import BookingTable from '../../Components/table/BookingTable';

function RoomStatusLegend() {
  const items = [
    { bg: '#d4edda', color: '#155724', text: '+', label: 'Available Room' },
    { bg: '#f8d7da', color: '#721c24', text: 'Booked', label: 'Already Booked' },
    { bg: '#e0e0e0', color: '#6c757d', text: '-', label: 'Under Maintenance' },
  ];

  return (
    <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
        {items.map(({ bg, color, text, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              backgroundColor: bg,
              color,
              padding: '6px 12px',
              borderRadius: 4,
              marginRight: 8,
              minWidth: 60,
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {text}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const maxDays = 7;

  const generateDateButtons = () =>
    Array.from({ length: maxDays }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const display = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const isSelected = selectedDate === dateString;

      return (
        <button
          key={dateString}
          onClick={() => setSelectedDate(dateString)}
          style={{
            backgroundColor: isSelected ? '#007BFF' : '#f0f0f0',
            color: isSelected ? 'white' : '#333',
            padding: '0.75rem',
            borderRadius: 6,
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            minWidth: 120,
            margin: '0 0.5rem',
            transition: 'background-color 0.2s',
          }}
        >
          {display}
        </button>
      );
    });

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333'
      }}>
        ROOM BOOKING
      </h2>

      {/* Quick date selector buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        {generateDateButtons()}
      </div>

      {/* Date picker */}
      <div style={{
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: '10px 20px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
        }}>
          <label style={{ marginRight: 10, fontWeight: 'bold' }}>Select date:</label>
          <DatePicker
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Room status legend */}
      <RoomStatusLegend />

      {/* Booking table */}
      <BookingTable date={selectedDate} status={[0, 1, 2, 6]} />
    </div>
  );
}
