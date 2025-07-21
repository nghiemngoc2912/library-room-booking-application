import axios from 'axios';

export async function fetchStudents(keyword = '', page = 1) {
  const res = await fetch(`https://localhost:7238/api/user/students?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export const getUserReputation = async (userId) => {
  const res = await axios.get(`https://localhost:7238/api/user/${userId}/reputation`);
  return res.data;
};