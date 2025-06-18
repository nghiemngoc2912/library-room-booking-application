import React from 'react';
import TextField from '@mui/material/TextField';

export default function BookingDatePicker({ value, onChange }) {
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Tính ngày hôm nay + 7 ngày
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split('T')[0];
  return (
    <TextField
      label="Select date"
      type="date"
      value={value}
      onChange={onChange}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        min: minDate,
        max: maxDate,
      }}
    />
  );
}