import axios from 'axios';

// 1. Fetch bookings theo ngày và trạng thái
export async function fetchBookingsByDateAndStatus(date, status) {
  const res = await fetch(`https://localhost:7238/api/Booking/date/${date}/status/${status}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

// 2. Fetch chi tiết 1 booking
export async function fetchBookingDetail(id) {
  const res = await fetch(`https://localhost:7238/api/Booking/${id}`, {
    credentials: 'include',
  });
  return res.json();
}

// 3. Lấy lịch sử đặt phòng (axios không dùng credentials theo mặc định)
export const getBookingHistory = async (userId, from, to, page = 1, pageSize = 5) => {
  const params = { from, to, page, pageSize };
  const res = await axios.get(`https://localhost:7238/api/Booking/user/${userId}/history`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

// 4. Gửi đánh giá
export const rateRoom = async (bookingId, ratingData) => {
  const res = await axios.post(
    `https://localhost:7238/api/Booking/${bookingId}/rate`,
    ratingData,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

// 5. Hủy đặt phòng
export const cancelBooking = async (id) => {
  return fetch(`https://localhost:7238/api/Booking/cancel/${id}`, {
    method: 'PATCH',
    credentials: 'include',
  });
};

// 6. Check-in
export const checkinBooking = async (id) => {
  const res = await fetch(`https://localhost:7238/api/Booking/${id}/checkin`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Check-in unsuccessfully');
  }

  return data;
};

// 7. Check-out
export const checkoutBooking = async (id) => {
  const res = await fetch(`https://localhost:7238/api/Booking/${id}/checkout`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Check-out unsuccessfully');
  }

  return data;
};
