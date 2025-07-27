import React from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

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
    <form style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <TextField
          type="date"
          label="Date"
          value={booking.bookingDate + ""}
          fullWidth
          readOnly
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: 16 }}>
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

      <TextField
        label="Reason"
        fullWidth
        value={booking.reason}
        readOnly
        style={{ marginBottom: 16 }}
      />

      <TextField
        label="Students"
        fullWidth
        value={booking.students?.map(s => s.fullName + " - " + s.code).join(', ')}
        InputProps={{ readOnly: true }}
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: 'flex', gap: '16px', marginBottom: 16 }}>
        <TextField
          label="Created By"
          fullWidth
          value={booking.createdBy.fullName + " - " + booking.createdBy.code}
        />
        <TextField
          label="Created At"
          fullWidth
          value={booking.createdDate + ""}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Checkin:</strong> {booking.checkInAt || 'None'}<br />
        <strong>Checkout:</strong> {booking.checkOutAt || 'None'}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {(role === 1 || role === 2) && (booking.status === 0|| booking.status === 6) && (
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
    </form>
  );
}