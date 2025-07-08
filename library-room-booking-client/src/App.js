import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import RoomBooking from './pages/roomBooking/RoomBooking';
import Home from './pages/roomBooking/Home';
import Login from './pages/auth/Login';
import NewsPage from './pages/roomBooking/NewsPage';
import ProfilePage from './pages/student/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';

const App = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://localhost:7238/api/auth/current-user', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch (err) {
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [location]);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) return <div>Loading...</div>; // Hiển thị loading trong khi kiểm tra
    if (role === null) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) {
      return <Navigate to={role === 1 ? '/home' : '/login'} replace />;
    }
    return children;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={[1, 3]}>
            <DefaultLayout><Home /></DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute allowedRoles={[1, 3]}>
            <DefaultLayout><RoomBooking /></DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/news"
        element={
          <ProtectedRoute allowedRoles={[1, 3]}>
            <DefaultLayout><NewsPage /></DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <DefaultLayout><ProfilePage userId={2} /></DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <DefaultLayout><AdminDashboard /></DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;