import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert, Stack, Paper } from '@mui/material';
import { getUserReputation } from '../../api/UserAPI';
import ReputationChart from './ReputationChart';

export default function ReputationView({ userId }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserReputation(userId)
      .then(setProfile)
      .catch(() => setError('Failed to load profile.'));
  }, [userId]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <p>Loading...</p>;

  return (
    <Box textAlign="center" maxWidth={1100} mx="auto" px={2}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Student Reputation
      </Typography>

      <Stack direction="row" spacing={6} justifyContent="center" alignItems="flex-start" mt={3}>
        {/* Pie Chart Section */}
        <Box>
          <Typography variant="h6" gutterBottom>Reputation Score</Typography>
          <ReputationChart violations={profile.violations} score={profile.reputation} />
          <Typography variant="h6" mt={2}>Current score: <b>{profile.reputation}</b></Typography>
        </Box>

        {/* Violation History Section */}
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <Button size="small" variant="outlined">CHANGE PASSWORD</Button>
          </Box>
          <Paper elevation={3} sx={{ p: 3, minWidth: 320 }}>
            <Typography variant="h6" gutterBottom>Violation History</Typography>
            <hr />
            {profile.violations.map((v, i) => (
              <Box key={i} display="flex" justifyContent="space-between" mt={1}>
                <Typography>{v.type}</Typography>
                <Typography>-{Math.abs(v.score)}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Stack>

      {/* Warning Section */}
      {profile.reputation < 80 && (
        <Box mt={5} px={4} py={3} bgcolor="#fff7e6" borderRadius={2} maxWidth={900} mx="auto" textAlign="left">
          <Typography color="error" fontWeight="bold" mb={1}>
            ⚠️ Warning:
          </Typography>
          <Typography>
            If your reputation score is below 80 points, you will not be able to book a room for 5 days.
          </Typography>
          <Typography>
            (5 points will be refunded in 5 days)
          </Typography>
        </Box>
      )}
    </Box>
  );
}
