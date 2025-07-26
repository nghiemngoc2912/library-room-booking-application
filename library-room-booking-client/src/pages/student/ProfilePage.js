import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import StudentSidebar from '../../Components/student/StudentSidebar';
import ReputationView from '../../Components/student/ReputationView';
import BookingHistoryPage from './BookingHistoryPage';
import ChangePasswordPage from './ChangePasswordPage';

export default function ProfilePage({ loggedInUserId, role }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryUserId = queryParams.get('userId');
  // Nếu là staff (role = 2), lấy userId từ query parameter; nếu là sinh viên (role = 1), dùng loggedInUserId
  const userId = role === 2 && queryUserId && !isNaN(parseInt(queryUserId, 10))
    ? parseInt(queryUserId, 10)
    : loggedInUserId;

  const [activeTab, setActiveTab] = useState('profile');

  // Debug giá trị
  console.log('ProfilePage - queryUserId:', queryUserId, 'userId:', userId, 'loggedInUserId:', loggedInUserId, 'role:', role);

  // Kiểm tra nếu userId không hợp lệ
  if (!userId || isNaN(userId)) {
    return <Box p={4}>Error: Invalid user ID. Please log in again.</Box>;
  }

  return (
    <Box display="flex" minHeight="100vh">
      <StudentSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userId={userId}
        loggedInUserId={loggedInUserId}
        role={role}
      />
      <Box flex={1} display="flex" justifyContent="center" alignItems="flex-start" p={4}>
        {activeTab === 'profile' && <ReputationView userId={userId} />}
        {activeTab === 'history' && <BookingHistoryPage userId={userId} />}
        {activeTab === 'change-password' && <ChangePasswordPage userId={userId} />}
      </Box>
    </Box>
  );
}