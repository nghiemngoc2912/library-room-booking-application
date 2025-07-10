import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import các Layout cần thiết
import DefaultLayout from './layouts/DefaultLayout';
import LibrarianLayout from './layouts/LibrarianLayout';
import AdminLayout from './layouts/AdminLayout';

// Import các Page Components
import RoomBooking from './pages/roomBooking/RoomBooking';
import Home from './pages/roomBooking/Home'; 
import ListRoom from './pages/roomManagement/ListRoom'; 
import UpdateRoom from './pages/roomManagement/UpdateRoom';
import CreateRoom from './pages/roomManagement/CreateRoom';
import Login from './pages/auth/Login';
import NewsPage from './pages/roomBooking/NewsPage';
import ProfilePage from './pages/student/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Không cần import HomeLayoutWrapper nữa

// Tạo Auth Context để chia sẻ role và loading state
// Export hook useAuth để các component con có thể dễ dàng sử dụng
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const App = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // useEffect để fetch thông tin người dùng hiện tại
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
        console.error("Error fetching current user:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [location]);

  // Component ProtectedRoute để bảo vệ các tuyến đường dựa trên vai trò
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (role === null) {
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(role)) {
      return <Navigate to={role === 1 ? '/home' : '/login'} replace />;
    }
    return children;
  };

  // Hiển thị loading toàn cục khi ứng dụng đang khởi tạo và kiểm tra xác thực
  if (loading) {
    return <div>Loading Application...</div>;
  }

  // Hàm trợ giúp để chọn layout dựa trên role
  const getHomeLayout = () => {
    if (role === 1) {
      return <DefaultLayout><Home /></DefaultLayout>;
    } else if (role === 2) {
      return <LibrarianLayout><Home /></LibrarianLayout>;
    } else if (role === 3) {
      return <AdminLayout><Home /></AdminLayout>;
    }
    // Fallback nếu role không khớp, có thể trả về null, một layout mặc định, hoặc chuyển hướng
    return <DefaultLayout><Home /></DefaultLayout>; // Mặc định về DefaultLayout
  };

  return (
    // AuthContext.Provider bao bọc toàn bộ Routes để cung cấp role và loading state
    <AuthContext.Provider value={{ role, loading, setRole }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Route cho trang Home, sử dụng hàm getHomeLayout để chọn layout động */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              {getHomeLayout()} {/* Gọi hàm để render layout phù hợp */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/room_management"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><ListRoom/></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/room_management/update"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><UpdateRoom /></LibrarianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/room_management/create"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><CreateRoom /></LibrarianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              <DefaultLayout><RoomBooking /></DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <DefaultLayout><NewsPage /></DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <DefaultLayout><ProfilePage userId={2} /></DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;
