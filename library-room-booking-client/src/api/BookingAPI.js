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
export const getBookingHistory = async (userId, from, to, page = 1, pageSize = 5) => {
  const params = { from, to, page, pageSize };
  const res = await axios.get(`https://localhost:7238/api/Booking/user/${userId}/history`, { params });
  return res.data;
};

export const rateRoom = async (bookingId, ratingData) => {
  const res = await axios.post(`https://localhost:7238/api/Booking/${bookingId}/rate`, ratingData);
  return res.data;
}
export const cancelBooking = async (id) => {
  return fetch(`https://localhost:7238/api/Booking/cancel/${id}`, {
    method: 'PATCH',
    credentials: 'include',
  });
};

export const checkinBooking = async (id) => {
  const res = await fetch(`https://localhost:7238/api/Booking/${id}/checkin`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const data = await res.json(); // lấy dữ liệu trả về (bao gồm cả khi lỗi)

  if (!res.ok) {
    throw new Error(data.message || 'Check-in unsuccessfully');
  }

  return data;
};


export const checkoutBooking = async (id) => {
  const res =  fetch(`https://localhost:7238/api/Booking/${id}/checkout`, {
    method: 'PATCH',
    credentials: 'include',
  });
  const data = await res.json(); // lấy dữ liệu trả về (bao gồm cả khi lỗi)

  if (!res.ok) {
    throw new Error(data.message || 'Check-out unsuccessfully');
  }

  return data;
};
