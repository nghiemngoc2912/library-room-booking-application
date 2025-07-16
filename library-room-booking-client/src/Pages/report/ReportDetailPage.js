"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getReportById } from "../../api/Reports"
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import InfoIcon from "@mui/icons-material/Info"
import HomeIcon from "@mui/icons-material/Home"
import VisibilityIcon from "@mui/icons-material/Visibility"
import PersonIcon from "@mui/icons-material/Person"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import RoomIcon from "@mui/icons-material/Room"

const ReportDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const reportId = location.state?.report?.id

  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        try {
          setLoading(true)
          const reportData = await getReportById(reportId)
          setReport(reportData)
        } catch (error) {
          console.error("Error fetching report:", error)
          setError("Failed to load report data.")
        } finally {
          setLoading(false)
        }
      }
      fetchReport()
    } else {
      setError("No report ID provided")
      setLoading(false)
    }
  }, [reportId])

  const handleBack = () => {
    navigate("/reports")
  }

  const handleStudentInfo = () => {
    navigate("/student-info", { state: { userId: report.userId, report: report } })
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const getStatusChip = (status) => {
    const isReplied = status === 1 || status === true
    return (
      <Chip
        label={isReplied ? "Replied" : "Pending"}
        color={isReplied ? "success" : "warning"}
        size="medium"
        variant="filled"
        sx={{ fontWeight: "bold" }}
      />
    )
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    )
  }

  if (error || !report) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Back to Reports
            </Button>
          }
        >
          {error || "Report not found"}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
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
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          <VisibilityIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Report Details
        </Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ p: 4, backgroundColor: "primary.main", color: "white" }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Report Details
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            View comprehensive information about this report
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
              Back to Reports
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        Report ID:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                        #{report.id}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        Type:
                      </Typography>
                      <Chip label={report.reportType || "N/A"} color="primary" variant="outlined" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        Status:
                      </Typography>
                      {getStatusChip(report.status)}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <RoomIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        Room ID:
                      </Typography>
                      <Typography variant="body1">{report.roomId || "N/A"}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Timeline Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
                    Timeline & User
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        Created:
                      </Typography>
                      <Typography variant="body1">{formatDate(report.createAt)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        Student:
                      </Typography>
                      <Typography variant="body1">{report.userName || `User #${report.userId}`}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        User ID:
                      </Typography>
                      <Typography variant="body1">#{report.userId}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
                    Description
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.6, minHeight: 60 }}>
                    {report.description || (
                      <span style={{ color: "#999", fontStyle: "italic" }}>No description provided</span>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<InfoIcon />}
              onClick={handleStudentInfo}
              size="large"
              sx={{ px: 4 }}
            >
              View Student Info
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default ReportDetailPage
