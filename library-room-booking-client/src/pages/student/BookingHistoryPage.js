import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, TextField, Button, Paper, Chip, Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RateRoomDialog from './RateRoomDialog';

export default function BookingHistoryPage({ userId, role }) {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const pageSize = 5;

  const fetchData = () => {
    console.log("Fetching data with:", { from, to, page: page + 1 });
    axios.get(`/api/Booking/user/${userId}/history`, {
      params: {
        from: from || undefined,
        to: to || undefined,
        page: page + 1,
        pageSize
      }
    }).then(res => {
      setBookings(res.data.data);
      setTotal(res.data.total);
    }).catch(err => {
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
      4: { label: 'Auto Canceled', color: 'warning' }
    };
    const { label, color } = statusMap[status] || { label: 'Unknown', color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Booking History
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
          onChange={e => setFrom(e.target.value)}
        />

        <TextField
          label="To"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={to}
          fullWidth
          onChange={e => setTo(e.target.value)}
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
                {role === 1 && <TableCell><strong>Rating</strong></TableCell>}
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
                  {role === 1 && (
                    <TableCell>
                      {b.rating ? (
                        <Box>
                          <Chip label={`${b.rating.ratingValue} ★`} color="primary" size="small" />
                          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line', maxWidth: 250 }}>
                            {b.rating.comment}
                          </Typography>
                        </Box>
                      ) : '—'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {role === 1 && !b.rating && b.status === 2 ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedBooking(b);
                            setOpenDialog(true);
                          }}
                        >
                          Rate
                        </Button>
                      ) : role === 1 && b.rating ? (
                        <Chip label="Rated" size="small" variant="outlined" color="success" />
                      ) : null}
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

      {role === 1 && (
        <RateRoomDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          booking={selectedBooking}
          userId={userId}
          onRated={fetchData}
        />
      )}
    </Box>
  );
}