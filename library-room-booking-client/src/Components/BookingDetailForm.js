import React from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Paper, Typography } from '@mui/material';

export default function BookingDetailForm({
  booking,
  role,
  slots,
  rooms,
  onChange,
  onCheckin,
  onCheckout,
  onCancel,
  onBack,
}) {
  if (!booking) return <div>Loading...</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Tiêu đề */}
      <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 'bold' }}>
        Booking Detail
      </Typography>

      <Paper elevation={3} style={{ padding: '30px' }}>
        {/* Ngày */}
        <div style={{ marginBottom: 24 }}>
          <TextField
            type="date"
            label="Date"
            value={booking.bookingDate + ""}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </div>

        {/* Slot và Room */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: 24 }}>
          <FormControl fullWidth>
            <InputLabel>Slot</InputLabel>
            <Select
              value={booking.slotId}
              readOnly
              label="Slot"
            >
              {slots.map(slot => (
                <MenuItem key={slot.id} value={slot.id}>
                  {slot.order ? `Slot ${slot.order}` : `Slot ${slot.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Room</InputLabel>
            <Select
              value={booking.roomId}
              readOnly
              label="Room"
            >
              {rooms.map(room => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name || `Room ${room.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Reason */}
        <TextField
          label="Reason"
          fullWidth
          value={booking.reason}
          InputProps={{ readOnly: true }}
          style={{ marginBottom: 24 }}
        />

        {/* Students */}
        <TextField
          label="Students"
          fullWidth
          value={booking.students?.map(s => s.fullName + " - " + s.code).join(', ')}
          InputProps={{ readOnly: true }}
          style={{ marginBottom: 24 }}
        />

        {/* Created By + Created At */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: 24 }}>
          <TextField
            label="Created By"
            fullWidth
            value={booking.createdBy.fullName + " - " + booking.createdBy.code}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Created At"
            fullWidth
            value={booking.createdDate + ""}
            InputProps={{ readOnly: true }}
          />
        </div>

        {/* Checkin - Checkout */}
        <div style={{ marginBottom: 24 }}>
          <strong>Checkin:</strong> {booking.checkInAt || 'None'}<br />
          <strong>Checkout:</strong> {booking.checkOutAt || 'None'}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {(role === 1 || role === 2) && (booking.status === 0 || booking.status === 6) && (
            <Button variant="contained" color="warning" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {role === 2 && booking.status === 0 && (
            <Button variant="contained" color="success" onClick={onCheckin}>
              Check-in
            </Button>
          )}
          {role === 2 && booking.status === 1 && (
            <Button variant="contained" color="info" onClick={onCheckout}>
              Check-out
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={onBack}>
            Back
          </Button>
        </div>
      </Paper>
    </div>
  );
}
