import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // thêm Navigate
import DefaultLayout from './layouts/DefaultLayout';
import RoomBooking from './pages/roomBooking/RoomBooking';
import Home from './pages/roomBooking/Home';
import Login from './pages/auth/Login';
import NewsPage from './pages/roomBooking/NewsPage';
import ProfilePage from './pages/student/ProfilePage';


const App = () => {
  return (
    <Routes>
      {/* Mặc định chuyển / sang /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Trang login */}
      <Route path="/login" element={<Login />} />

      {/* Trang sau login */}
      <Route path="/home" element={<DefaultLayout><Home /></DefaultLayout>} />
      <Route path="/booking" element={<DefaultLayout><RoomBooking /></DefaultLayout>} />

      {/* Redirect nếu không khớp route nào */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/news" element={<DefaultLayout><NewsPage /></DefaultLayout>} />
      <Route
        path="/student/profile"
        element={<DefaultLayout><ProfilePage userId={2} /></DefaultLayout>}
      />

    </Routes>
  );
};

export default App;
