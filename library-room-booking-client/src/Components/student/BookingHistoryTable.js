import React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Pagination
} from '@mui/material';

export default function BookingHistoryTable({ bookings, total, page, onPageChange, onRate }) {
  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Slot</TableCell>
            <TableCell>Room</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.bookingDate}</TableCell>
              <TableCell>{b.slot}</TableCell>
              <TableCell>{b.roomName}</TableCell>
              <TableCell>
                {b.rating ? 'Rated' :
                  <Button variant="outlined" onClick={() => onRate(b)}>Rate</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        count={Math.ceil(total / 5)}
        page={page}
        onChange={(_, val) => onPageChange(val)}
        sx={{ mt: 2 }}
      />
    </>
  );
}
