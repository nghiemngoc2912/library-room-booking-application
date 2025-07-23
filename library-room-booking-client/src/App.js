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
import ListSlot from './pages/slotManagement/ListSlot';
import CreateSlot from './pages/slotManagement/CreateSlot';
import UpdateSlot from './pages/slotManagement/UpdateSlot';
import RequestRoom from './pages/admin/RequestRoom';
import DetailRequestRoom from './pages/admin/DetailRequestRoom';
import SlotRequest from './pages/admin/SlotRequest';
import DetailSlotRequest from './pages/admin/DetailSlotRequest';
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized'
import NewsPage from './pages/roomBooking/NewsPage';
import ProfilePage from './pages/student/ProfilePage';
import BookingDetailPage from './pages/roomBooking/BookingDetail';
import AdminDashboard from './pages/admin/AdminDashboard';

import { BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import RulesPage from './pages/rule/RulesPage';
import ReportsPage from './pages/report/ReportsPage';
import AddRulePage from './pages/rule/AddRulePage';
import EditRulePage from './pages/rule/EditRulePage';
import AddReportPage from './pages/report/AddReportPage';
import ReportDetailPage from './pages/report/ReportDetailPage';
import StudentInfoPage from './pages/report/StudentInfoPage';
import HistoryReportPage from './pages/report/HistoryReportPage';
import ReportTypeDetailsPage from './pages/report/ReportTypeDetailsPage';
import StudentListPage from './pages/student/StudentListPage';
import StudentNewsPage from './pages/student/StudentNewsPage';

import './App.css';

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
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // useEffect để fetch thông tin người dùng hiện tại
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://localhost:7238/api/auth/current-user', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('API response:', data); // Debug
          const newUserId = data.id; // Lấy id từ API
          const newRole = data.role; // Lấy role từ API
          setRole(newRole);
          setUserId(newUserId);
          console.log('Updated userId:', newUserId, 'role:', newRole); // Debug sau khi set
        } else {
          console.log('API error:', response.status, response.statusText);
          setUserId(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Network error:', err);
        setUserId(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Component ProtectedRoute để bảo vệ các tuyến đường dựa trên vai trò
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (role === null) {
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    return children;
  };

  if (loading) {
    return <div>Loading Application...</div>;
  }

  const PublicRoute = ({ children }) => {
    const { role, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    // Nếu đã đăng nhập => redirect về /home
    if (role !== null) {
      return <Navigate to="/home" replace />;
    }

    return children; // Nếu chưa login => cho vào trang login
  };

  // Hàm trợ giúp để chọn layout dựa trên role
  const getHomeLayout = () => {
    if (role === 1) {
      return <DefaultLayout><Home /></DefaultLayout>;
    } else if (role === 2) {
      return <LibrarianLayout><Home /></LibrarianLayout>;
    } else if (role === 3) {
      return <AdminLayout><Home /></AdminLayout>;
    }
    return <DefaultLayout><Home /></DefaultLayout>; // Mặc định về DefaultLayout
  };

  return (
    // AuthContext.Provider bao bọc toàn bộ Routes để cung cấp role và loading state
    <AuthContext.Provider value={{ role, loading, setRole, userId }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/unauthorized" element={<Unauthorized />} />

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
              <LibrarianLayout><ListRoom /></LibrarianLayout>
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
          path="/slot_management"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><ListSlot /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/slot_management/create"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><CreateSlot /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/slot_management/update"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><UpdateSlot /></LibrarianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/request_room"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <AdminLayout><RequestRoom /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/request_room/detail"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <AdminLayout><DetailRequestRoom /></AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/request_slot"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <AdminLayout><SlotRequest /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/request_slot/detail"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <AdminLayout><DetailSlotRequest /></AdminLayout>
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
              <DefaultLayout><ProfilePage userId={userId} /></DefaultLayout>
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
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><StudentListPage /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/news"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <DefaultLayout><StudentNewsPage /></DefaultLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/booking/detail/:id" element={<DefaultLayout><BookingDetailPage role={role} /></DefaultLayout>} />

        <Route path="/rules" element={<RulesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/add-rule" element={<AddRulePage />} />
        <Route path="/edit-rule" element={<EditRulePage />} />
        <Route path="/add-report" element={<AddReportPage />} />
        <Route path="/report-detail" element={<ReportDetailPage />} />
        <Route path="/student-info" element={<StudentInfoPage />} />
        <Route path="/history-report" element={<HistoryReportPage />} />
        <Route path="/report-type-details" element={<ReportTypeDetailsPage />} />
        <Route path="/" element={<Navigate to="/reports" />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
};
export default App;