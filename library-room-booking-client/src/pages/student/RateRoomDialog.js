import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Rating, Typography
} from '@mui/material';
import axios from 'axios';

export default function RateRoomDialog({ open, onClose, booking, userId, onRated }) {
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    // reset mỗi lần mở dialog mới
    if (open) {
      setValue(5);
      setComment('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!booking || !userId) return;

    try {
      await axios.post(`/api/Booking/${booking.id}/rate`, {
        ratingValue: value,
        comment,
        studentId: userId
      });

      onRated();     // gọi lại fetch data ở BookingHistory
      onClose();     // đóng dialog
    } catch (err) {
      console.error('Rating failed:', err.response?.data || err.message);
      alert('Failed to submit rating.');
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rate Room</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          <strong>Room:</strong> {booking.room} &nbsp;&nbsp;
          <strong>Slot:</strong> {booking.slot}
        </Typography>

        <Rating
          value={value}
          onChange={(_, newVal) => setValue(newVal)}
        />

        <TextField
          label="Comment"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
