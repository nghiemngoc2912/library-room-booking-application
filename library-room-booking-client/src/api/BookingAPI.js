export async function fetchBookingsByDateAndStatus(date,status) {
  const res = await fetch(`https://localhost:7238/api/Booking/date/${date}/status/${status}`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}
