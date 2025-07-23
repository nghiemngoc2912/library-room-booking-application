import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReport } from "../../api/Reports";
import ReportForm from "../../Components/form/ReportForm";
import {
  Button,
  Container,
  Typography,
  Box,
  Alert,
  Paper,
  Breadcrumbs,
  Link,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";

const AddReportPage = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState({
    ruleId: 1,
    reportType: "",
    description: "",
    createAt: new Date().toISOString(),
    userId: parseInt(localStorage.getItem("userId")),
    roomId: 1,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openConfirm, setOpenConfirm] = useState(false);

  const validateReport = () => {
    if (!report.reportType.trim()) {
      setError("Report type is required");
      return false;
    }
    if (report.reportType.length < 3) {
      setError("Report type must be at least 3 characters long");
      return false;
    }
    if (report.description && report.description.length > 1000) {
      setError("Description must be less than 1000 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateReport()) return;
    setOpenConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      await createReport(report);
      setSnackbar({
        open: true,
        message: `Report "${report.reportType}" created successfully`,
        severity: "success",
      });
      setOpenConfirm(false);
      setTimeout(() => {
        navigate("/history-report");
      }, 1500);
    } catch (error) {
      setError(`Failed to create report. ${error.response?.data?.message || error.message}`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport({ ...report, [name]: value });
    if (error) setError(null);
  };

  const handleBack = () => {
    navigate("/history-report");
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          color="inherit"
          onClick={handleBack}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Reports
        </Link>
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          <AddIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          New Report
        </Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
            New Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a new report with the form below
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={loading}>
            Back to History
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <ReportForm report={report} onChange={handleChange} onSubmit={handleSubmit} loading={loading} />
      </Paper>

      <Dialog open={openConfirm} onClose={handleCloseConfirm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "primary.light", color: "white", p: 3 }}>
          Confirm Report Submission
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText sx={{ mb: 2, color: "text.secondary" }}>
            Are you sure you want to submit the report titled "{report.reportType}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleCloseConfirm} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmSubmit} color="primary" variant="contained" disabled={loading}>
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
};

export default AddReportPage;
