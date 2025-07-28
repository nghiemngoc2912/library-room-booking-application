import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getReportTypesByUser } from "../../api/Reports";
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
  Alert,
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";

const HistoryReportPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [reportTypes, setReportTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const types = await getReportTypesByUser(userId);
        console.log("Fetched report types for user:", userId, types);

        if (Array.isArray(types)) {
          setReportTypes(types);
        } else {
          setReportTypes([]);
          setError("Unexpected response format from server.");
          setSnackbar({
            open: true,
            message: "Invalid response from server.",
            severity: "error",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load report types. Please try again later.");
        setSnackbar({
          open: true,
          message: "Failed to load report types.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReportTypes();
    } else {
      setError("No user ID found. Please log in again.");
      setSnackbar({
        open: true,
        message: "No user ID found.",
        severity: "error",
      });
      setLoading(false);
    }
  }, [userId]);

const handleViewTypeDetails = (type) => {
  navigate(`/report-type-details?userId=${userId}&reportType=${encodeURIComponent(type)}`);
};


  const handleBack = () => {
    navigate("/reports");
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading report types...
        </Typography>
      </Container>
    );
  }

  if (error && reportTypes.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate("/reports")}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Reports
        </Link>
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          <DescriptionIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Report History
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
        Report History
      </Typography>
      <Typography align="center" sx={{ color: "text.secondary", mb: 4 }}>
        List of report types submitted by user
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: "primary.main" }}>
                Total Report Types
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {reportTypes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #ccc" }}>
          <Typography variant="h6" fontWeight="bold">
            Report Types
          </Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Report Type</TableCell>
              <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No report types found
                  </Typography>
                  <Typography color="text.secondary">
                    This user has not submitted any reports.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reportTypes.map((type) => (
                <TableRow key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleViewTypeDetails(type)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

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

export default HistoryReportPage;
