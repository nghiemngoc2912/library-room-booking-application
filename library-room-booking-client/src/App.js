import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // thêm Navigate
import DefaultLayout from './layouts/DefaultLayout';
import RoomBooking from './pages/roomBooking/RoomBooking';
import Home from './pages/roomBooking/Home';
import Login from './pages/auth/Login';

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
    </Routes>
  );
};

export default App;
