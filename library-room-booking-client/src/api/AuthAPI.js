import axios from 'axios';

const API_BASE_URL = 'https://localhost:7238/api'; // Thay bằng địa chỉ backend thực tế

/**
 * Gửi thông tin đăng nhập đến backend sử dụng session/cookie.
 */
export const login = async (username, password) => {
  return await axios.post(
    `${API_BASE_URL}/auth/login`,
    {
      username,
      password,
    },
    {
      withCredentials: true, // Quan trọng để gửi cookie (chứa session ID)
    }
  );
};
