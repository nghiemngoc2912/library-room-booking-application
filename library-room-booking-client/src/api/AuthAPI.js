import axios from 'axios';

const API_BASE_URL = 'https://localhost:7238/api';

export const login = async (username, password) => {
  return await axios.post(
    `${API_BASE_URL}/auth/login`,
    { username, password },
    { withCredentials: true }
  );
};

export const forgotPassword = async (email) => {
  return await axios.post(
    `${API_BASE_URL}/auth/forgot-password`,
    { email },
    { withCredentials: true }
  );
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  return await axios.post(
    `${API_BASE_URL}/auth/reset-password`,
    {
      token,
      newPassword,
      confirmPassword,
    },
    { withCredentials: true }
  );
};

export const register = async (data) => {
  return await axios.post(
    `${API_BASE_URL}/auth/register`,
    {
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      dob: data.dob ? data.dob.split('T')[0] : null, 
      code: '',
    },
    { withCredentials: true }
  );
};



export const verifyOtp = async (username, otpCode) => {
  return await axios.post(
    `${API_BASE_URL}/auth/verify-otp`,
    { username, otpCode },
    { withCredentials: true }
  );
};
