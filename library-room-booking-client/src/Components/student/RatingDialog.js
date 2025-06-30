import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, TextField, Button
} from '@mui/material';

export default function RatingDialog({ open, onClose, onSubmit }) {
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit({ score: value, comment });
    setValue(0);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rate Room</DialogTitle>
      <DialogContent>
        <Rating value={value} onChange={(_, newValue) => setValue(newValue)} />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Comment"
          margin="normal"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
