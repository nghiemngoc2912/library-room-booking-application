
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import RulesPage from './Pages/rule/RulesPage';
import ReportsPage from './Pages/report/ReportsPage';
import AddRulePage from './Pages/rule/AddRulePage';
import EditRulePage from './Pages/rule/EditRulePage';
import AddReportPage from './Pages/report/AddReportPage';
import ReportDetailPage from './Pages/report/ReportDetailPage';
import StudentInfoPage from './Pages/report/StudentInfoPage';
import HistoryReportPage from './Pages/report/HistoryReportPage';
import ReportTypeDetailsPage from './Pages/report/ReportTypeDetailsPage';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import './App.css';

function App() {
  const navigate = useNavigate();

  const handleTestHistory = () => {
    // Thay 1 bằng userId có trong cơ sở dữ liệu
    navigate("/history-report", { state: { userId: 1 } });
  };

  return (
    <div className="App">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Library Room Booking
          </Typography>
          <Button color="inherit" component={Link} to="/rules">
            Rules
          </Button>
          <Button color="inherit" component={Link} to="/reports">
            Reports
          </Button>
          <Button color="inherit" onClick={handleTestHistory}>
             History
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, maxWidth: '1280px' }}>
        <Routes>
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
        </Routes>
      </Container>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}