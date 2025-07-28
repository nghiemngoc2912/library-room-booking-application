import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, TextField, Button, Paper, Stack, Chip, Container, Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ChangePasswordPage from '../../pages/student/ChangePasswordPage'; 

export default function LibrarianProfilePage({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  const pageSize = 5;

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

  // Fetch booking history
  const fetchData = () => {
    console.log("Fetching data with:", { from, to, page: page + 1 });
    axios.get(`/api/Booking/user/${userId}/history`, {
      params: {
        from: from || undefined,
        to: to || undefined,
        page: page + 1,
        pageSize
      },
      credentials: 'include',
    })
      .then(res => {
        setBookings(res.data.data);
        setTotal(res.data.total);
      })
      .catch(err => {
        console.error("Fetch error:", err);
      });
  };

  useEffect(() => { fetchData(); }, [page]);

  // Map status values to display text and colors
  const getStatusChip = (status) => {
  const statusMap = {
    0: { label: 'Booked', color: 'primary' },
    1: { label: 'Checked In', color: 'success' },
    2: { label: 'Checked Out', color: 'default' },
    3: { label: 'Canceled', color: 'error' },
    4: { label: 'Auto Canceled', color: 'warning' },
    5: { label: 'Canceled for Maintenance', color: 'error' },
    6: { label: 'Booked for Maintenance', color: 'info' }
  };

    const { label, color } = statusMap[status] || { label: 'Unknown', color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

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
            <Typography><strong>Role:</strong> Staff</Typography>
            <Typography><strong>Ngày sinh:</strong> {userInfo.dob ? new Date(userInfo.dob).toLocaleDateString() : 'Chưa cập nhật'}</Typography>
          </Box>
        ) : (
          <Typography>Đang tải thông tin...</Typography>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>

      {/* Booking History */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Lịch sử đặt phòng
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' },
          gap: 2,
          mb: 3,
          maxWidth: '100%',
        }}
      >
        <TextField
          label="From"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={from}
          fullWidth
          onChange={(e) => setFrom(e.target.value)}
        />

        <TextField
          label="To"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={to}
          fullWidth
          onChange={(e) => setTo(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ height: '100%', whiteSpace: 'nowrap' }}
          onClick={() => {
            setPage(0);
            fetchData();
          }}
        >
          FILTER
        </Button>
      </Box>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Paper elevation={3} sx={{ width: '100%', minWidth: 1000 }}>
          <Table size="medium">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Room</strong></TableCell>
                <TableCell><strong>Slot</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.bookingDate}</TableCell>
                  <TableCell>{b.roomName}</TableCell>
                  <TableCell>{b.slot}</TableCell>
                  <TableCell>{getStatusChip(b.status)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/booking/detail/${b.id}`}
                      >
                        Detail
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPageOptions={[pageSize]}
          />
        </Paper>
      </Box>

      {/* Change Password (gọi form hiện có) */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        Đổi mật khẩu
      </Typography>
      <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
        <ChangePasswordPage userId={userId} /> {/* Gọi component hiện có */}
      </Box>
    </Container>
  );
}

