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

  const [studentInput, setStudentInput] = useState('');
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roomData = await fetchRoomById(roomId);
        const slotInfo = await fetchSlotById(slotId);

        setRoomName(roomData?.roomName || 'Không rõ phòng');
        setSlotInfo(
          slotInfo
            ? `${slotInfo.order} (${slotInfo.fromTime} - ${slotInfo.toTime})`
            : 'Không rõ slot'
        );
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

  const handleStudentInputChange = (e) => {
    const value = e.target.value;
    setStudentInput(value);

    if (value.length >= 2) {
      fetch(`https://localhost:7238/api/User/Search?code=${value}`, {
        credentials: 'include'
      })
        .then((res) => res.json())
        .then((data) => setSuggestedStudents(data))
        .catch((err) => console.error(err));
    } else {
      setSuggestedStudents([]);
    }
  };

  const handleSelectStudent = (student) => {
    if (!selectedStudents.some((s) => s.code === student.code)) {
      setSelectedStudents([...selectedStudents, student]);
    }
    setStudentInput('');
    setSuggestedStudents([]);
  };

  const handleRemoveStudent = (code) => {
    setSelectedStudents(selectedStudents.filter((s) => s.code !== code));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("You must agree to the rules.");
      return;
    }

    const payload = {
      BookingDate: date,
      SlotId: parseInt(slotId),
      RoomId: parseInt(roomId),
      Reason: reason,
      StudentListCode: selectedStudents.map((s) => s.code),
    };

    fetch('https://localhost:7238/api/Booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      withCredentials: true,
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        if (res.ok) {
          setMessage(`✅ ${text}`);
          setSelectedStudents([]);
        } else {
          setMessage(`❌ ${text}`);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage('❌ Internal error while booking.');
      });
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📅 Room Booking</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div><strong>📌 Date:</strong> {date}</div>
            <div><strong>🏠 Room:</strong> {roomName}</div>
            <div><strong>🕒 Slot:</strong> {slotInfo}</div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label><strong>📖 Reason:</strong></label><br />
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ padding: '0.5rem', width: '100%', borderRadius: '6px' }}
            >
              <option value="" disabled>-- Choose Reason --</option>
              {bookingReasons.map((r, index) => (
                <option key={index} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label><strong>👥 Add Student:</strong></label><br />
            <input
              type="text"
              value={studentInput}
              onChange={handleStudentInputChange}
              placeholder="Enter student code or name"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
            />
            {suggestedStudents.length > 0 && (
              <ul style={{
                border: '1px solid #ccc',
                marginTop: '0.5rem',
                padding: '0.5rem',
                borderRadius: '6px',
                listStyle: 'none',
                maxHeight: '150px',
                overflowY: 'auto',
              }}>
                {suggestedStudents.map((s, index) => (
                  <li key={index} style={{ cursor: 'pointer', padding: '0.25rem 0' }} onClick={() => handleSelectStudent(s)}>
                    {s.fullName} ({s.code})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedStudents.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>📋 Selected Students:</strong>
              <ul style={{ paddingLeft: '1rem' }}>
                {selectedStudents.map((s) => (
                  <li key={s.code} style={{ marginBottom: '0.25rem' }}>
                    {s.fullName} ({s.code})
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(s.code)}
                      style={{
                        marginLeft: '1rem',
                        color: 'white',
                        backgroundColor: 'red',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the booking rules.
            </label>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#007BFF',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            ✅ Book Room
          </button>
        </form>
      )}
      {message && (
        <p style={{
          marginTop: '1.5rem',
          color: message.startsWith("✅") ? "green" : "red",
          textAlign: 'center',
          fontWeight: 'bold'
        }}>{message}</p>
      )}
    </div>
  );
};

export default RoomBooking;
