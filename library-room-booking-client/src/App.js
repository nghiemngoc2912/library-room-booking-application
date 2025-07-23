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
import ProfilePage from './Pages/student/ProfilePage';
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

// Không cần import HomeLayoutWrapper nữa

// Tạo Auth Context để chia sẻ role và loading state
// Export hook useAuth để các component con có thể dễ dàng sử dụng
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const App = () => {
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
        const res = await fetch('https://localhost:7238/api/auth/current-user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Current user response:', data);
          const userRole = parseInt(data.role, 10);
          if (userRole) {
            setRole(userRole);
            localStorage.setItem('role', userRole);
          } else {
            console.log('Invalid role in response, setting role to null');
            setRole(null);
            localStorage.removeItem('role');
            localStorage.removeItem('authToken');
          }
        } else {
          console.error('Current user API failed:', res.status, res.statusText);
          setRole(null);
          localStorage.removeItem('role');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setRole(null);
        localStorage.removeItem('role');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    // Chỉ gọi API nếu role là null, có token, và không ở trang login
    if (role === null && localStorage.getItem('authToken') && location.pathname !== '/login') {
      console.log('Fetching current user for path:', location.pathname);
      fetchCurrentUser();
    } else {
      console.log('Skipping fetch, role:', role, 'path:', location.pathname);
      setLoading(false);
    }
  }, [location.pathname]);

   // Component ProtectedRoute để bảo vệ các tuyến đường dựa trên vai trò
  const ProtectedRoute = ({ children, allowedRoles }) => {
    console.log('ProtectedRoute - Role:', role, 'Allowed:', allowedRoles, 'Path:', location.pathname);
    if (loading) return <div>Loading...</div>;
    if (role === null) {
      console.log('Redirect to login: role is null');
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(role)) {
      console.log('Redirect to login: role not allowed');
      return <Navigate to="/login" replace />;
    }
    return children; 
  };

// Hàm trợ giúp để chọn layout dựa trên role
  const getHomeLayout = () => {
    switch (role) {
      case 1:
        return <DefaultLayout><Home /></DefaultLayout>;
      case 2:
        return <LibrarianLayout><Home /></LibrarianLayout>;
      case 3:
        return <AdminLayout><Home /></AdminLayout>;
      default:
        console.log('Redirect to login: invalid role for home');
        return <Navigate to="/login" replace />;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Home by role */}
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            {getHomeLayout()}
          </ProtectedRoute>
        } />

        {/* Student */}
        <Route path="/booking" element={
          <ProtectedRoute allowedRoles={[1]}>
            <DefaultLayout><RoomBooking /></DefaultLayout>
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

        {/* Librarian */}
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

        {/* Admin */}
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

        {/* Shared */}
        <Route path="/booking/detail/:id" element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            <DefaultLayout><BookingDetailPage /></DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/user/students" element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminLayout><StudentList /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;