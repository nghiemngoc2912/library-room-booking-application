import axios from 'axios';
export async function fetchBookingsByDateAndStatus(date,status) {
  const res = await fetch(`https://localhost:7238/api/Booking/date/${date}/status/${status}`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}
export async function fetchBookingDetail(id) {
  const res = await fetch(`https://localhost:7238/api/Booking/${id}`);
  return res.json();
}
export async function updateBooking(id, data) {
  const res = await fetch(`https://localhost:7238/api/Booking/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteBooking(id) {
  const res = await fetch(`https://localhost:7238/api/Booking/bookings/${id}`, { method: 'DELETE' });
  return res.json();
}
export const getBookingHistory = async (userId, from, to, page = 1, pageSize = 5) => {
  const params = { from, to, page, pageSize };
  const res = await axios.get(`https://localhost:7238/api/Booking/user/${userId}/history`, { params });
  return res.data;
};

export const rateRoom = async (bookingId, ratingData) => {
  const res = await axios.post(`https://localhost:7238/api/Booking/${bookingId}/rate`, ratingData);
  return res.data;
}