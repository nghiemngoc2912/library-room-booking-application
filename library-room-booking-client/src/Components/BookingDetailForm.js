import React from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function BookingDetailForm({
  booking,
  slots,
  rooms,
  onChange,
  onUpdate,
  onDelete,
  onBack
}) {
  if (!booking) return <div>Loading...</div>;

  return (
    <form style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <TextField
          type="date"
          label="Date"
          value={booking.bookingDate+""}
          onChange={e => onChange('date', e.target.value)}
          fullWidth
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: 16 }}>
        <FormControl fullWidth>
          <InputLabel>Slot</InputLabel>
          <Select
            value={booking.slotId}
            onChange={e => onChange('slotId', e.target.value)}
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
            onChange={e => onChange('roomId', e.target.value)}
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
        onChange={e => onChange('reason', e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <TextField
        label="Students"
        fullWidth
        value={booking.students?.map(s => s.fullName+" - "+s.code).join(', ')} // chuyển thành chuỗi tên cách nhau bằng dấu phẩy
        InputProps={{ readOnly: true }} // không cho sửa
        style={{ marginBottom: 16 }}
        />

      <div style={{ display: 'flex', gap: '16px', marginBottom: 16 }}>
        <TextField
          label="Created By"
          fullWidth
          value={booking.createdBy.fullName+" - "+booking.createdBy.code}
        />
        <TextField
          label="Created At"
          fullWidth
          value={booking.createdDate+""}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Checkin:</strong> {booking.checkinAt || 'None'}<br />
        <strong>Checkout:</strong> {booking.checkoutAt || 'None'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" onClick={onBack}>Back to booking history</Button>
        <div>
          <Button variant="contained" color="primary" onClick={onUpdate} style={{ marginRight: 8 }}>Update</Button>
          <Button variant="contained" color="error" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </form>
  );
}
