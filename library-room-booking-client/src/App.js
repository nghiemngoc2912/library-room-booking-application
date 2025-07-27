import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import các Layout cần thiết
import DefaultLayout from './layouts/DefaultLayout';
import LibrarianLayout from './layouts/LibrarianLayout';
import AdminLayout from './layouts/AdminLayout';

// Import các Page Components
import RoomBooking from './Pages/roomBooking/RoomBooking';
import Home from './Pages/roomBooking/Home';
import ListRoom from './Pages/roomManagement/ListRoom';
import UpdateRoom from './Pages/roomManagement/UpdateRoom';
import CreateRoom from './Pages/roomManagement/CreateRoom';
import ListSlot from './Pages/slotManagement/ListSlot';
import CreateSlot from './Pages/slotManagement/CreateSlot';
import UpdateSlot from './Pages/slotManagement/UpdateSlot';
import RequestRoom from './Pages/admin/RequestRoom';
import DetailRequestRoom from './Pages/admin/DetailRequestRoom';
import SlotRequest from './Pages/admin/SlotRequest';
import DetailSlotRequest from './Pages/admin/DetailSlotRequest';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import Unauthorized from './Pages/auth/Unauthorized'
import NewsPage from './Pages/roomBooking/NewsPage';
import ProfilePage from './Pages/student/ProfilePage';
import BookingDetailPage from './Pages/roomBooking/BookingDetail';
import AdminDashboard from './Pages/admin/AdminDashboard';
import ResetPasswordPage from './Pages/auth/ResetPasswordPage';
import ForgotPasswordPage from './Pages/auth/ForgotPasswordPage';
import LibrarianManagement from './Pages/librarianManagement/LibrarianManagement'
import MaintenanceBooking from './Pages/roomManagement/MaintenanceBooking'; 
import LibrarianProfilePage from './Pages/librarian/LibrarianProfilePage';
import AdminProfilePage from './Pages/admin/AdminProfilePage';

import { BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import RulesPage from './Pages/rule/RulesPage';
import ReportsPage from './Pages/report/ReportsPage';
import AddRulePage from './Pages/rule/AddRulePage';
import EditRulePage from './Pages/rule/EditRulePage';
import AddReportPage from './Pages/report/AddReportPage';
import ReportDetailPage from './Pages/report/ReportDetailPage';
import StudentInfoPage from './Pages/report/StudentInfoPage';
import HistoryReportPage from './Pages/report/HistoryReportPage';
import ReportTypeDetailsPage from './Pages/report/ReportTypeDetailsPage';
import StudentListPage from './Pages/student/StudentListPage';
import StudentNewsPage from './Pages/student/StudentNewsPage';

import './App.css';
import { Dashboard } from '@mui/icons-material';

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
      return <AdminLayout><AdminDashboard /></AdminLayout>;
    }
    return <DefaultLayout><Home /></DefaultLayout>; // Mặc định về DefaultLayout
  };

  const getNewsLayout = () => {
    if (role === 1) {
      return <DefaultLayout><NewsPage /></DefaultLayout>;
    } else if (role === 2) {
      return <LibrarianLayout><NewsPage /></LibrarianLayout>;
    } 
    return <DefaultLayout><NewsPage /></DefaultLayout>; 
  };

  const getProfileLayout = () => {
    if (role === 1) {
      return <DefaultLayout><ProfilePage loggedInUserId={userId} role={role} /></DefaultLayout>;
    } else if (role === 2) {
      return <LibrarianLayout><ProfilePage loggedInUserId={userId} role={role} /></LibrarianLayout>;
    }
    return <DefaultLayout><ProfilePage loggedInUserId={userId} role={role} /></DefaultLayout>;
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

        <Route path="/register" element={
          <PublicRoute>
            <Register />
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
          path="/room_management/maintenance"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><MaintenanceBooking /></LibrarianLayout>
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
          path="/librarian/profile"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><LibrarianProfilePage userId={userId} /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <AdminLayout><AdminProfilePage userId={userId} /></AdminLayout>
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
              {getNewsLayout()} {/* Gọi hàm để render layout phù hợp */}
            </ProtectedRoute>
          }
        />
        <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            {getProfileLayout()}
          </ProtectedRoute>
        }
      />
        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              <DefaultLayout>
                <ProfilePage userId={userId} /> {/* Truyền userId vào ProfilePage */}
              </DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
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

        <Route
          path="/booking/detail/:id"
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <DefaultLayout><BookingDetailPage role={role} /></DefaultLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rules"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><RulesPage /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><ReportsPage /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-rule"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><AddRulePage /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-rule"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><EditRulePage /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-report"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <DefaultLayout><AddReportPage /></DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-detail"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><ReportDetailPage /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-info"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <LibrarianLayout><StudentInfoPage /></LibrarianLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history-report"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <DefaultLayout><HistoryReportPage /></DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-type-details"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <DefaultLayout><ReportTypeDetailsPage /></DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage_librarians"
          element={
            <ProtectedRoute allowedRoles={[3]}> 
              <AdminLayout>
                <LibrarianManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
};
export default App;