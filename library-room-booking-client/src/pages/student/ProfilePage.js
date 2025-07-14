// src/pages/student/ProfilePage.js
import React, { useState } from 'react';
import { Box } from '@mui/material';
import StudentSidebar from '../../Components/student/StudentSidebar';
import ReputationView from '../../Components/student/ReputationView';
import BookingHistoryPage from './BookingHistoryPage';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Box display="flex" minHeight="100vh">
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Box flex={1} display="flex" justifyContent="center" alignItems="flex-start" p={4}>
        {activeTab === 'profile' && <ReputationView userId={2} />}
        {activeTab === 'history' && <BookingHistoryPage userId={2} />}
      </Box>
    </Box>
  );
}
