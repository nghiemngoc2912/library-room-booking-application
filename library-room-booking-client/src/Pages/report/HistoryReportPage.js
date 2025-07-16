import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getReportTypesByUser } from "../../api/Reports"
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
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import HomeIcon from "@mui/icons-material/Home"
import DescriptionIcon from "@mui/icons-material/Description"

const HistoryReportPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.userId
  const [reportTypes, setReportTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        setLoading(true)
        setError(null)
        const reportTypes = await getReportTypesByUser(userId)
        console.log("API Response:", reportTypes)
        setReportTypes(reportTypes)
      } catch (error) {
        console.error("Error fetching report types:", error)
        setError("Unable to load report type list. Please try again.")
        setSnackbar({
          open: true,
          message: "Unable to load report type list",
          severity: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchReportTypes()
    } else {
      setError("No user ID provided")
      setLoading(false)
    }
  }, [userId])

  const handleViewTypeDetails = (type) => {
    navigate("/report-type-details", { state: { userId, reportType: type } })
  }

  const handleBack = () => {
    navigate("/reports")
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", maxWidth: "1280px", margin: "0 auto" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading report type list...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error && reportTypes.length === 0) {
    return (
      <Container sx={{ py: 4, maxWidth: "1280px", margin: "0 auto" }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Back
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4, maxWidth: "1280px", margin: "0 auto" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          color="inherit"
          onClick={() => navigate("/reports")}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Reports
        </Link>
        <Typography sx={{ display: "flex", alignItems: "center" }} color="text.primary">
          <DescriptionIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Report History
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ textAlign: "center", color: "primary.main", fontWeight: "bold" }}>
          Report History
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", color: "text.secondary" }}>
          List of report types for the user
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to report list
        </Button>
      </Box>

      {/* Summary Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>
                Total number of report types
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {reportTypes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ overflow: "hidden", borderRadius: 1, boxShadow: "0 3px 5px rgba(0, 0, 0, 0.2)" }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            List of report types
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            View details of reports by type
          </Typography>
        </Box>

        <Table sx={{ minWidth: 650 }} aria-label="report types table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white", py: 2 }}>Report Type</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", py: 2 }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 6, textAlign: "center" }}>
                  <Box sx={{ textAlign: "center" }}>
                    <DescriptionIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No report types found
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      This user has no reports
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              reportTypes.map((type) => (
                <TableRow
                  key={type}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body1">{type}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }} align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleViewTypeDetails(type)}
                      sx={{ textTransform: "none", borderRadius: 1, px: 2 }}
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

      {/* Snackbar for notifications */}
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
  )
}

export default HistoryReportPage