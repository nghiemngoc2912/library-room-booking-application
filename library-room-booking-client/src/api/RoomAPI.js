export async function fetchRooms() {
  const res = await fetch('https://localhost:7238/api/Room');
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}
