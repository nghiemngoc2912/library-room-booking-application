import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingDetailForm from '../../Components/BookingDetailForm';
import { fetchBookingDetail, updateBooking, deleteBooking } from '../../api/BookingAPI';

import { fetchSlots } from '../../api/SlotAPI';
import { fetchRooms } from '../../api/RoomAPI';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchBookingDetail(id).then(setBooking);
    fetchSlots().then(setSlots);
    fetchRooms().then(setRooms);
  }, [id]);

  const handleChange = (field, value) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    updateBooking(id, booking).then(() => alert('Updated successfully!'));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(id).then(() => {
        alert('Deleted successfully!');
        navigate('/booking/history');
      });
    }
  };

  return (
    <BookingDetailForm
      booking={booking}
      slots={slots}
      rooms={rooms}
      onChange={handleChange}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onBack={() => navigate('/booking/history')}
    />
  );
}
