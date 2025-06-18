export async function fetchRooms() {
  const res = await fetch('https://localhost:7238/api/Room');
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}
export async function fetchRoomById(roomId) {
  const res = await fetch(`https://localhost:7238/api/Room/${roomId}`);
  if (!res.ok) throw new Error('Failed to fetch room');
  return res.json();
}
