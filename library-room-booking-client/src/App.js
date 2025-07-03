// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import RoomBooking from './pages/roomBooking/RoomBooking';
import Home from './pages/roomBooking/Home';
import BookingDetailPage from './pages/roomBooking/BookingDetail';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />
      <Route path="/booking" element={<DefaultLayout><RoomBooking /></DefaultLayout>} />
      <Route path="/booking/detail/:id" element={<DefaultLayout><BookingDetailPage /></DefaultLayout>} />
    </Routes>
  );
};

export default App;
