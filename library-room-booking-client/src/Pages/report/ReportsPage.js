"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getReportsList, updateReportStatus } from "../../api/Reports"
import ReportTable from "../../Components/table/ReportTable"
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import RefreshIcon from "@mui/icons-material/Refresh"
import EditIcon from "@mui/icons-material/Edit"
import { useAuth } from '../../App';

const ReportsPage = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState(0);

  console.log('ReportsPage rendered, role:', role); // Log để kiểm tra render

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReportsList();
      console.log('Reports fetched:', response); // Log dữ liệu reports
      setReports(response);
      setFilteredReports(response);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to load reports',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.reportType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => {
        if (statusFilter === "pending") return report.status === 0;
        if (statusFilter === "replied") return report.status === 1;
        return true;
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((report) => report.reportType === typeFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, typeFilter]);

  const handleAddReport = () => {
    navigate("/add-report");
  };

  const handleDetailReport = (report) => {
    navigate("/report-detail", { state: { report } });
  };

  const handleStatusChange = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status || 0);
    setOpenDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (selectedReport) {
      try {
        await updateReportStatus(selectedReport.id, newStatus);
        setReports(reports.map(r => r.id === selectedReport.id ? { ...r, status: newStatus } : r));
        setFilteredReports(filteredReports.map(r => r.id === selectedReport.id ? { ...r, status: newStatus } : r));
        setSnackbar({
          open: true,
          message: `Status for report "${selectedReport.reportType}" updated successfully`,
          severity: "success",
        });
        setOpenDialog(false);
      } catch (error) {
        console.error("Error updating status:", error);
        setError("Failed to update report status.");
        setSnackbar({
          open: true,
          message: "Failed to update status",
          severity: "error",
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
    setNewStatus(0);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRefresh = () => {
    fetchReports();
  };

  const reportTypes = [...new Set(reports.map((report) => report.reportType).filter(Boolean))];

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading reports...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && reports.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ fontWeight: "bold" }}>
          Reports Management
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Monitor and manage student reports and violations
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
            <TextField
              fullWidth
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '16.66%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: "action.active" }} />}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="replied">Replied</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '16.66%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
                <MenuItem value="all">All Types</MenuItem>
                {reportTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={`${filteredReports.length} of ${reports.length} reports`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '16.66%' } }}>
            <Box display="flex" gap={1}>
              <Button variant="outlined" onClick={handleRefresh} disabled={loading} size="small">
                <RefreshIcon />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid sx={{ width: '100%' }}>
          <ReportTable 
            reports={filteredReports} 
            onDetail={handleDetailReport} 
            onStatusChange={handleStatusChange} 
            loading={loading} 
          />
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "primary.light", color: "white", p: 3 }}>
          Change Report Status
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText sx={{ mb: 2, color: "text.secondary" }}>
            Change the status for report "{selectedReport?.reportType}"?
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
              <MenuItem value={0}>Pending</MenuItem>
              <MenuItem value={1}>Replied</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStatusChange}
            color="primary"
            variant="contained"
            sx={{ textTransform: "none", borderRadius: 1, px: 3 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ReportsPage;