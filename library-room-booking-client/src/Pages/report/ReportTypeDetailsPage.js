import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getReportsList } from "../../api/Reports"
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Button,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import HomeIcon from "@mui/icons-material/Home"
import DescriptionIcon from "@mui/icons-material/Description"

const ReportTypeDetailsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId, reportType } = location.state || {}
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError(null)
        const allReports = await getReportsList()
        const filteredReports = allReports.filter(
          (report) => report.userId === userId && report.reportType === reportType
        )
        setReports(filteredReports)
      } catch (error) {
        console.error("Error fetching reports:", error)
        setError("Unable to load report list. Please try again.")
        setSnackbar({
          open: true,
          message: "Unable to load report list",
          severity: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId && reportType) {
      fetchReports()
    } else {
      setError("No user information or report type provided")
      setLoading(false)
    }
  }, [userId, reportType])

  const handleBack = () => {
    navigate("/history-report", { state: { userId } })
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", width: "100%", margin: 0 }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading report list...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error || !reportType) {
    return (
      <Container sx={{ py: 4, width: "100%", margin: 0 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Back
            </Button>
          }
        >
          {error || "No report type to display"}
        </Alert>
      </Container>
    )
  }

  const report = reports.length > 0 ? reports[0] : null // Take the first report to display a single report

  // Convert status number to text
  const getStatusText = (status) => {
    if (status === 0) return "Pending"
    return "Replied"
  }

  return (
    <Container sx={{ py: 4, width: "100%", margin: 0 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3, pl: 2 }} aria-label="breadcrumb">
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          color="inherit"
          onClick={() => navigate("/reports")}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Reports
        </Link>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          color="inherit"
          onClick={() => navigate("/history-report", { state: { userId } })}
        >
          <DescriptionIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Report History
        </Link>
        <Typography sx={{ display: "flex", alignItems: "center" }} color="text.primary">
          Details for type {reportType}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ color: "primary.main", fontWeight: "bold" }}>
          Details for type {reportType}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
          Report information for type {reportType} of user (User ID: {userId})
        </Typography>
      </Box>

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Report History
        </Button>
      </Box>

      {report ? (
        <Grid container justifyContent="center">
          <Grid item>
            <Card sx={{ width: 400, boxShadow: 2, display: "flex", flexDirection: "column", border: "1px solid #e0e0e0" }}>
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", p: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>
                    Report #{report.id}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                    Date created: {new Date(report.createAt).toLocaleDateString("en-US")}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#333", mb: 2 }}>
                    Description: {report.description || "No description"}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Status: {getStatusText(report.status)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No report found
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No report exists for type {reportType}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}

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

export default ReportTypeDetailsPage