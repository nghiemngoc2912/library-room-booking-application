import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingDetailForm from '../../Components/BookingDetailForm';
import { fetchBookingDetail, updateBooking, deleteBooking } from '../../api/BookingAPI';
import { cancelBooking, checkinBooking, checkoutBooking } from '../../api/BookingAPI';

import { fetchSlots } from '../../api/SlotAPI';
import { fetchRooms } from '../../api/RoomAPI';

export default function BookingDetailPage({ role }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  const reloadBooking = () => {
    fetchBookingDetail(id).then(data => {
      setBooking(data);
    });
  };

  useEffect(() => {
    reloadBooking();
  }, [id]);

  
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
  const handleCancel = async () => {
  if (window.confirm('Do you want to cancel booking?')) {
    await cancelBooking(id);
    alert('Booking is canceled');
    reloadBooking(); // reload lại detail
  }
};

const handleCheckin = async () => {
  try {
    const result = await checkinBooking(id);
    alert('✅ Check-in successfully: ' + result.checkInAt);
    // gọi lại API hoặc reload chi tiết booking nếu cần
  } catch (error) {
    alert('❌ Error check-in: ' + error.message);
  }
  reloadBooking();
};


const handleCheckout = async () => {
  try {
    const result = await checkoutBooking(id);
    alert('✅ Check-out successfully: ' + result.checkOutAt);
    // gọi lại API hoặc reload chi tiết booking nếu cần
  } catch (error) {
    alert('❌ Error check-out: ' + error.message);
  }
  reloadBooking();
};


  return (
    <BookingDetailForm
      booking={booking}
      slots={slots}
      rooms={rooms}
      role={role}
      onChange={handleChange}
      onCancel={handleCancel}
      onCheckin={handleCheckin}
      onCheckout={handleCheckout}
      onBack={() => navigate('/booking/history')}
    />
  );
}
