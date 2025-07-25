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
import { useAuth } from '../../App';

export default function BookingTable({ date, status}) {
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const { role } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const isPastDate = date < today;

  useEffect(() => {
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
      setBookings([]);
    }
  }, [date, status, isPastDate]);

  const getBooking = (roomId, slotId) => {
    return bookings.find(b => b.roomId === roomId && b.slotId === slotId);
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
                const booking = getBooking(room.id, slot.id);
                const cellText = isRoomInactive
                  ? '-'
                  : booking
                  ? (role === 2 ? (
                      <Link
                        to={`/booking/detail/${booking.id}`}
                        style={{ fontWeight: 'bold', textDecoration: 'underline', color: 'red' }}
                      >
                        Đã đặt
                      </Link>
                    ) : 'Đã đặt')
                  : (role === 1 ? (
                      <Link
                        to={`/booking?roomId=${room.id}&slotId=${slot.id}&date=${date}`}
                        style={{ fontWeight: 'bold', textDecoration: 'underline' }}
                      >
                        +
                      </Link>
                    ) : null);
                const bgColor = isRoomInactive
                  ? '#e0e0e0'
                  : booking
                  ? '#f8d7da'
                  : '#d4edda';
                const textColor = isRoomInactive
                  ? '#6c757d'
                  : booking
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