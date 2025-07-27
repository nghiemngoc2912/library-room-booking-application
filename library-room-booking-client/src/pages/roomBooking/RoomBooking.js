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

        setRoomName(roomData?.roomName || 'Unknown room');
        setSlotInfo(
          slotInfo
            ? `${slotInfo.order} (${slotInfo.fromTime} - ${slotInfo.toTime})`
            : 'Unknown slot'
        );
      } catch (err) {
        console.error(err);
        setError('Unable to load room or slot data.');
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
    <div style={{
      maxWidth: 750,
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #eee',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '2.5rem'
      }}>
        Room Booking
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold' }}>Day:</label>
              <div>{date}</div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold' }}>Slot:</label>
              <div>{slotInfo}</div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold' }}>Room:</label>
              <div>{roomName}</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Purpose:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                padding: '0.5rem',
                width: '100%',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginTop: '0.5rem'
              }}
            >
              <option value="" disabled>-- Choose Reason --</option>
              {bookingReasons.map((r, index) => (
                <option key={index} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Students:</label>
            <input
              type="text"
              value={studentInput}
              onChange={handleStudentInputChange}
              placeholder="Search for a student"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginTop: '0.5rem'
              }}
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
                backgroundColor: 'white'
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
            <div style={{ marginBottom: '1.5rem' }}>
              <ul style={{ paddingLeft: '1rem' }}>
                {selectedStudents.map((s) => (
                  <li key={s.code} style={{ marginBottom: '0.5rem' }}>
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

          <div style={{
            backgroundColor: '#e6f4ea',
            border: '1px solid #bde0c0',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            lineHeight: '1.6'
          }}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li>If plans change and the room is not needed, please cancel the booking before the scheduled time.</li>
              <li>Rooms are only for study purposes. Misuse or booking without usage will result in a ban for one term.</li>
              <li>Ensure the facilities in the room are intact. Damages will require compensation as per regulations.</li>
              <li>Return the room to its original condition after use.</li>
              <li>Do not remove any facilities from the room during usage.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              I agree to comply with the room booking rules.
            </label>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
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
            Save changes
          </button>
        </div>
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