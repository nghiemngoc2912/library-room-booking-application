import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Alert,
} from '@mui/material';
import axios from 'axios';
import ChangePasswordPage from '../../Pages/student/ChangePasswordPage';

export default function AdminProfilePage({ userId }) {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Fetch user info
  useEffect(() => {
    if (!userId) {
      setError('User ID is not available. Please log in again.');
      return;
    }
    axios.get(`https://localhost:7238/api/user/${userId}`, {
      withCredentials: true
    })
      .then(res => {
        setUserInfo(res.data);
      })
      .catch(err => {
        setError('Error fetching user info. Please try again.');
        console.error('Error fetching user info:', err);
      });
  }, [userId]);

  return (
    <Container maxWidth="lg" sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile
      </Typography>

      {/* User Information */}
      <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Thông tin cá nhân</Typography>
        {userInfo ? (
          <Box>
            <Typography><strong>Tên:</strong> {userInfo.fullName || 'Chưa cập nhật'}</Typography>
            <Typography><strong>Email:</strong> {userInfo.email || 'Chưa cập nhật'}</Typography>
            <Typography><strong>Role:</strong> Admin</Typography>
            <Typography><strong>Ngày sinh:</strong> {userInfo.dob ? new Date(userInfo.dob).toLocaleDateString() : 'Chưa cập nhật'}</Typography>
          </Box>
        ) : (
          <Typography>Đang tải thông tin...</Typography>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>

      {/* Change Password */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        Đổi mật khẩu
      </Typography>
      <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
        <ChangePasswordPage userId={userId} />
      </Box>
    </Container>
  );
}