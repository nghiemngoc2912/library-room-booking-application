import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';

import { fetchSlots } from '../../api/SlotAPI';
import { fetchRooms } from '../../api/RoomAPI';
import { fetchBookingsByDateAndStatus } from '../../api/BookingAPI';

export default function BookingTable({ date = '2025-06-17', status = 0}) {
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const isPastDate = date < today;

  useEffect(() => {
    // Luôn fetch slots và rooms
    Promise.all([fetchSlots(), fetchRooms()])
      .then(([slotsData, roomsData]) => {
        setSlots(slotsData);
        setRooms(roomsData);
      })
      .catch(err => console.error('Lỗi khi tải slots hoặc rooms:', err));
  if (!isPastDate) {
      fetchBookingsByDateAndStatus(date, status)
        .then(setBookings)
        .catch(err => console.error('Lỗi khi tải bookings:', err));
    } else {
      // Nếu ngày đã qua thì không fetch booking, reset bookings
      setBookings([]);
    }
  }, [date, status, isPastDate]);

  const isBooked = (roomId, slotId) => {
    return bookings.some(b => b.roomId === roomId && b.slotId === slotId);
  };
return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="booking table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Room</strong></TableCell>
            {slots.map((slot) => (
              <TableCell key={slot.id} align="center">
                Slot {slot.order} ({slot.fromTime} - {slot.toTime})
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell component="th" scope="row">
                {room.roomName}
              </TableCell>

              {slots.map((slot) => {
                const isRoomInactive = room.status === 0;
                const booked = isBooked(room.id, slot.id);

                const cellText = isRoomInactive
                  ? '-'
                  : booked
                  ? '-'
                  : <Link
                    to={`/booking?roomId=${room.id}&slotId=${slot.id}&date=${date}`}
                    style={{fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    +
                  </Link>;

                const bgColor = isRoomInactive
                  ? '#e0e0e0' // xám
                  : booked
                  ? '#f8d7da' // đỏ nhạt
                  : '#d4edda'; // xanh nhạt

                const textColor = isRoomInactive
                  ? '#6c757d'
                  : booked
                  ? '#721c24'
                  : '#155724';

                return (
                  <TableCell
                    key={slot.id}
                    align="center"
                    sx={{
                      backgroundColor: bgColor,
                      color: textColor,
                      fontWeight: 'bold',
                    }}
                  >
                    {cellText}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}