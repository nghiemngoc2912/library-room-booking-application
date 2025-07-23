import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Import các Layout cần thiết
import DefaultLayout from './layouts/DefaultLayout';
import LibrarianLayout from './layouts/LibrarianLayout';
import AdminLayout from './layouts/AdminLayout';

// Import các Page Components
import Login from './Pages/auth/Login';
import Home from './Pages/roomBooking/Home';
import RoomBooking from './Pages/roomBooking/RoomBooking';
import NewsPage from './Pages/roomBooking/NewsPage';
import BookingDetailPage from './Pages/roomBooking/BookingDetail';
import StudentList from './Pages/user/StudentList';
import AdminDashboard from './Pages/admin/AdminDashboard';
import ListRoom from './Pages/roomManagement/ListRoom';
import CreateRoom from './Pages/roomManagement/CreateRoom';
import UpdateRoom from './Pages/roomManagement/UpdateRoom';
import ListSlot from './Pages/slotManagement/ListSlot';
import CreateSlot from './Pages/slotManagement/CreateSlot';
import UpdateSlot from './Pages/slotManagement/UpdateSlot';
import RequestRoom from './Pages/admin/RequestRoom';
import DetailRequestRoom from './Pages/admin/DetailRequestRoom';
import SlotRequest from './Pages/admin/SlotRequest';
import DetailSlotRequest from './Pages/admin/DetailSlotRequest';
import RulesPage from './Pages/rule/RulesPage';
import AddRulePage from './Pages/rule/AddRulePage';
import EditRulePage from './Pages/rule/EditRulePage';
import ReportsPage from './Pages/report/ReportsPage';
import AddReportPage from './Pages/report/AddReportPage';
import ReportDetailPage from './Pages/report/ReportDetailPage';
import StudentInfoPage from './Pages/report/StudentInfoPage';
import HistoryReportPage from './Pages/report/HistoryReportPage';
import ReportTypeDetailsPage from './Pages/report/ReportTypeDetailsPage';

// Tạo Auth Context
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const App = () => {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('role') ? parseInt(localStorage.getItem('role'), 10) : null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token found, setting role to null');
        setRole(null);
        localStorage.removeItem('role');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://localhost:7238/api/auth/current-user', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          localStorage.removeItem('role');
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        console.error('Network error:', err);
        setUserId(null);
        setRole(null);
        localStorage.removeItem('role');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    if (role === null && localStorage.getItem('authToken') && location.pathname !== '/login') {
      console.log('Fetching current user for path:', location.pathname);
      fetchCurrentUser();
    } else {
      console.log('Skipping fetch, role:', role, 'path:', location.pathname);
      setLoading(false);
    }
  }, [location.pathname]);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    console.log('ProtectedRoute - Role:', role, 'Allowed:', allowedRoles, 'Path:', location.pathname);
    if (loading) return <div>Loading...</div>;
    if (role === null) {
      console.log('Redirect to login: role is null');
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
    switch (role) {
      case 1:
        return <DefaultLayout><Home /></DefaultLayout>;
      case 2:
        return <LibrarianLayout><Home /></LibrarianLayout>;
      case 3:
        return <AdminLayout><AdminDashboard /></AdminLayout>;
      default:
        console.log('Redirect to login: invalid role for home');
        return <Navigate to="/login" replace />;
    }
  };

  if (loading) return <div>Loading...</div>;

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

        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              {getHomeLayout()} {/* Gọi hàm để render layout phù hợp */}
            </ProtectedRoute>
          }
        />

        <Route path="/booking" element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            <DefaultLayout>
              <RoomBooking role={role} />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/news" element={
          <ProtectedRoute allowedRoles={[1]}>
            <DefaultLayout><NewsPage /></DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRoles={[1]}>
            <DefaultLayout><ProfilePage /></DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-report" element={
          <ProtectedRoute allowedRoles={[1]}>
            <DefaultLayout><AddReportPage /></DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/history-report" element={
          <ProtectedRoute allowedRoles={[1]}>
            <DefaultLayout><HistoryReportPage /></DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/report-type-details" element={
          <ProtectedRoute allowedRoles={[1]}>
            <DefaultLayout><ReportTypeDetailsPage /></DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path="/room_management" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><ListRoom /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/room_management/create" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><CreateRoom /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/room_management/update" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><UpdateRoom /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/slot_management" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><ListSlot /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/slot_management/create" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><CreateSlot /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/slot_management/update" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><UpdateSlot /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/rules" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><RulesPage /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-rule" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><AddRulePage /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit-rule" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><EditRulePage /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><ReportsPage /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/report-detail" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><ReportDetailPage /></LibrarianLayout>
          </ProtectedRoute>
        } />
        <Route path="/student-info" element={
          <ProtectedRoute allowedRoles={[2]}>
            <LibrarianLayout><StudentInfoPage /></LibrarianLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/request_room" element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminLayout><RequestRoom /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/request_room/detail" element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminLayout><DetailRequestRoom /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/request_slot" element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminLayout><SlotRequest /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/request_slot/detail" element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminLayout><DetailSlotRequest /></AdminLayout>
          </ProtectedRoute>
        } />

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

        <Route path="/booking/detail/:id" element={<DefaultLayout><BookingDetailPage role={role} /></DefaultLayout>} />
        <Route path="/user/students" element={<DefaultLayout><StudentList /></DefaultLayout>} />

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