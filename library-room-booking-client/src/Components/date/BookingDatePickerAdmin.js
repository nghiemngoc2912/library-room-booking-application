import React from 'react';
import TextField from '@mui/material/TextField';

export default function BookingDatePickerAdmin({ value, onChange }) {
  return (
    <TextField
      label="Select date"
      type="date"
      value={value || ''} 
      onChange={onChange}
      InputLabelProps={{ shrink: true }}
      inputProps={{
      }}
    />
  );
}