import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

export default function StudentSidebar({ activeTab, onTabChange }) {
  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        bgcolor: '#f5f5f5',
        borderRight: '1px solid #ddd',
        pt: 10, // Đẩy nội dung xuống sâu hơn (tăng từ 4 → 10)
        boxSizing: 'border-box',
      }}
    >
      <Box px={2}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          User Profile
        </Typography>

        <Stack spacing={2}>
          <Button
            variant={activeTab === 'profile' ? 'contained' : 'outlined'}
            fullWidth
            onClick={() => onTabChange('profile')}
          >
            Profile
          </Button>
          <Button
            variant={activeTab === 'history' ? 'contained' : 'outlined'}
            fullWidth
            onClick={() => onTabChange('history')}
          >
            Booking History
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}