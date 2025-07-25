import axios from 'axios';

const API_BASE_URL = 'https://localhost:7238/api';

export const login = async (username, password) => {
  return await axios.post(
    `${API_BASE_URL}/auth/login`,
    { username, password },
    { withCredentials: true }
  );
};

export async function forgotPassword(email) {
  return await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });
}

export async function resetPassword(token, newPassword, confirmPassword) {
  return await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      newPassword,
      confirmPassword, 
    }),
    credentials: 'include',
  });
}
