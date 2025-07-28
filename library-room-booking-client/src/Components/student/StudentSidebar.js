import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

export default function StudentSidebar({ activeTab, onTabChange, userId, loggedInUserId, role }) {
  const isOwnProfile = Number(loggedInUserId) === Number(userId);
  const showChangePassword = isOwnProfile && role === 1; // Chỉ hiển thị cho sinh viên xem profile của chính mình

  // Debug giá trị
  console.log('StudentSidebar - loggedInUserId:', loggedInUserId, 'typeof loggedInUserId:', typeof loggedInUserId);
  console.log('StudentSidebar - userId:', userId, 'typeof userId:', typeof userId);
  console.log('StudentSidebar - role:', role, 'isOwnProfile:', isOwnProfile, 'showChangePassword:', showChangePassword);

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        bgcolor: '#f5f5f5',
        borderRight: '1px solid #ddd',
        pt: 10,
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
          {showChangePassword && (
            <Button
              variant={activeTab === 'change-password' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => onTabChange('change-password')}
            >
              Change Password
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}