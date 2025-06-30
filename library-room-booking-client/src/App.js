// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import RoomBooking from './pages/roomBooking/RoomBooking';
import Home from './pages/roomBooking/Home';
import NewsPage from './pages/roomBooking/NewsPage';
import ProfilePage from './pages/student/ProfilePage';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />
      <Route path="/booking" element={<DefaultLayout><RoomBooking /></DefaultLayout>} />
      <Route path="/news" element={<DefaultLayout><NewsPage /></DefaultLayout>} />
      <Route
        path="/student/profile"
        element={<DefaultLayout><ProfilePage userId={2} /></DefaultLayout>}
      />

    </Routes>
  );
};

export default App;
