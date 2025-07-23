import React, { useState } from 'react';
import { Box } from '@mui/material';
import StudentSidebar from '../../Components/student/StudentSidebar';
import ReputationView from '../../Components/student/ReputationView';
import BookingHistoryPage from './BookingHistoryPage';
import ChangePasswordPage from './ChangePasswordPage'; // Import component mới

export default function ProfilePage({ userId }) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Box display="flex" minHeight="100vh">
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Box flex={1} display="flex" justifyContent="center" alignItems="flex-start" p={4}>
        {activeTab === 'profile' && <ReputationView userId={userId} />}
        {activeTab === 'history' && <BookingHistoryPage userId={userId} />}
        {activeTab === 'change-password' && <ChangePasswordPage userId={userId}/>} {/* Thêm component mới */}
      </Box>
    </Box>
  );
}