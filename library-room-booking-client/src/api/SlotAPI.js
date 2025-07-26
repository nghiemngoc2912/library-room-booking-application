export async function fetchSlots() {
  const res = await fetch('https://localhost:7238/api/Slot', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch slots');
  return res.json();
}

export async function fetchSlotById(slotId) {
  const res = await fetch(`https://localhost:7238/api/Slot/${slotId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch slot');
  return res.json();
}
