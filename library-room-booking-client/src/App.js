// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import RoomBooking from './pages/roomBooking/RoomBooking';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout><RoomBooking /></DefaultLayout>} />
    </Routes>
  );
};

export default App;
