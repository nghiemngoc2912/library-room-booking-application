import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import RemoveIcon from "@mui/icons-material/Remove";
import WarningIcon from "@mui/icons-material/Warning";

const StudentInfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const report = location.state?.report;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reputationChange, setReputationChange] = useState(-5);
  const [reason, setReason] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [userId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://localhost:7238/api/Student/${userId}/related`);
      setStudents(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      setError("Failed to load student information. Please try again.");
      setSnackbar({
        open: true,
        message: "Failed to load student information",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (student = null) => {
    setSelectedStudent(student);
    setReputationChange(-5);
    setReason("");
    setBulkMode(student === null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
    setReason("");
  };

  const handleSubmit = async () => {
    try {
      if (bulkMode) {
        await axios.post(`https://localhost:7238/api/Student/${userId}/subtract-related`, {
          change: reputationChange,
          reason: reason,
        });
        setSnackbar({
          open: true,
          message: `Successfully subtracted ${Math.abs(reputationChange)} point(s) from all students' reputation`,
          severity: "success",
        });
      } else {
        await axios.post(`https://localhost:7238/api/Student/${selectedStudent.id}/subtract-reputation`, {
          change: reputationChange,
          reason: reason,
        });
        setSnackbar({
          open: true,
          message: `Successfully subtracted ${Math.abs(reputationChange)} point(s) from ${selectedStudent.fullName}'s reputation`,
          severity: "success",
        });
      }
      await fetchStudents();
      handleCloseDialog();
    } catch (error) {
      console.error("Lỗi khi trừ uy tín:", error);
      setSnackbar({
        open: true,
        message: "Failed to subtract reputation. Please try again.",
        severity: "error",
      });
    }
  };

  const handleBack = () => {
    if (report) {
      navigate("/report-detail", { state: { report } });
    } else {
      navigate("/reports");
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderStars = (reputation) => {
    const stars = [];
    const maxStars = 5;
    const currentReputation = reputation ?? 0;

    for (let i = 0; i < maxStars; i++) {
      stars.push(
        i < currentReputation ? (
          <StarIcon key={i} color="warning" sx={{ mx: 0.25 }} />
        ) : (
          <StarBorderIcon key={i} color="disabled" sx={{ mx: 0.25 }} />
        )
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading student information...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && students.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Go Back
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          color="inherit"
          onClick={() => navigate("/reports")}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Reports
        </Link>
        {report && (
          <Link
            underline="hover"
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            color="inherit"
            onClick={() => navigate("/report-detail", { state: { report } })}
          >
            Report Details
          </Link>
        )}
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Student Information
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ fontWeight: "bold" }}>
          Related Students
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Manage student reputation and violations
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          {report ? "Back to Report Details" : "Back to Reports"}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<RemoveIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ ml: 2 }}
        >
          Subtract All
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Average Reputation
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {students.length > 0
                  ? (students.reduce((sum, student) => sum + (student.reputation ?? 0), 0) / students.length).toFixed(1)
                  : "0"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main" gutterBottom>
                Low Reputation
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {students.filter((student) => (student.reputation ?? 0) <= 2).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ overflow: "hidden" }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Students List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student reputation and apply violations
          </Typography>
        </Box>

        <Table sx={{ minWidth: 650 }} aria-label="related students table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white", py: 2 }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", py: 2 }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", py: 2 }}>Reputation</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", py: 2 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Box textAlign="center">
                    <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No related students found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no students associated with this report
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const reputation = student.reputation ?? 0;
                return (
                  <TableRow
                    key={student.id}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      "&:hover": { backgroundColor: "#f0f0f0" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
                        #{student.id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body1">{student.fullName}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {renderStars(reputation)}
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({reputation}/5)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }} align="center">
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<RemoveIcon />}
                        onClick={() => handleOpenDialog(student)}
                        disabled={reputation === 0}
                        sx={{ textTransform: "none", borderRadius: 1, px: 2 }}
                      >
                        Subtract Points
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "error.light", color: "white", p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon />
            {bulkMode
              ? "Subtract Reputation for All Students"
              : `Subtract Reputation for ${selectedStudent?.fullName}`}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText sx={{ mb: 3, color: "text.secondary", fontSize: "1rem" }}>
            Enter the number of reputation points to subtract and the reason.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Points to Subtract"
            type="number"
            fullWidth
            value={reputationChange}
            onChange={(e) => setReputationChange(parseInt(e.target.value))}
            sx={{ mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Reason"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="error"
            variant="contained"
            disabled={!reason}
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
};

export default StudentInfoPage;