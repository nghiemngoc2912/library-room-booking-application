"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import StarIcon from "@mui/icons-material/Star"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import HomeIcon from "@mui/icons-material/Home"
import PersonIcon from "@mui/icons-material/Person"
import RemoveIcon from "@mui/icons-material/Remove"
import WarningIcon from "@mui/icons-material/Warning"

// Định nghĩa số điểm trừ tương ứng với mỗi hành vi
const violationPoints = {
  "Minor Violation": -1,
  Violation: -2,
  "Serious Violation": -3,
  Other: -1,
}

const StudentInfoPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.userId
  const report = location.state?.report
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [selectedReason, setSelectedReason] = useState("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRelatedStudents = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`https://localhost:7238/api/student/${userId}/related`)
        console.log("API Response:", response.data)
        setStudents(response.data)
      } catch (error) {
        console.error("Error fetching related students:", error)
        setError("Failed to load student information. Please try again.")
        setSnackbar({
          open: true,
          message: "Failed to load student information",
          severity: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRelatedStudents()
    } else {
      setError("No user ID provided")
      setLoading(false)
    }
  }, [userId])

  const handleSubtractReputation = async (studentId, change) => {
    try {
      const response = await axios.post(`https://localhost:7238/api/student/${studentId}/subtract-reputation`, {
        change: change,
        reason: selectedReason,
      })
      const updatedStudents = await axios.get(`https://localhost:7238/api/student/${userId}/related`)
      setStudents(updatedStudents.data)
      
      // Sử dụng change gửi đi để hiển thị thông báo (giả định backend xử lý đúng)
      setSnackbar({
        open: true,
        message: `Successfully subtracted ${Math.abs(change)} point(s) from student's reputation`,
        severity: "success",
      })
    } catch (error) {
      console.error("Error subtracting reputation:", error)
      setSnackbar({
        open: true,
        message: "Failed to subtract reputation. Please try again.",
        severity: "error",
      })
    }
  }

  const handleOpenDialog = (studentId) => {
    setSelectedStudentId(studentId)
    setSelectedReason("")
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedStudentId(null)
    setSelectedReason("")
  }

  const handleConfirmSubtract = async () => {
    if (selectedStudentId && selectedReason) {
      const change = violationPoints[selectedReason] || -1
      await handleSubtractReputation(selectedStudentId, change)
      handleCloseDialog()
    }
  }

  const handleBack = () => {
    if (report) {
      navigate("/report-detail", { state: { report } })
    } else {
      navigate("/reports")
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const renderStars = (reputation) => {
    const stars = []
    const maxStars = 5
    const currentReputation = reputation ?? 0

    for (let i = 0; i < maxStars; i++) {
      stars.push(
        i < currentReputation ? (
          <StarIcon key={i} color="warning" sx={{ mx: 0.25 }} />
        ) : (
          <StarBorderIcon key={i} color="disabled" sx={{ mx: 0.25 }} />
        ),
      )
    }
    return stars
  }

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
    )
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
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
      </Box>

      {/* Summary Card */}
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
                const reputation = student.reputation ?? 0
                return (
                  <TableRow
                    key={student.studentId}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      "&:hover": { backgroundColor: "#f0f0f0" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
                        #{student.studentId}
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
                        onClick={() => handleOpenDialog(student.studentId)}
                        disabled={reputation === 0}
                        sx={{ textTransform: "none", borderRadius: 1, px: 2 }}
                      >
                        Subtract Points
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "error.light", color: "white", p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon />
            Confirm Reputation Deduction
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText sx={{ mb: 3, color: "text.secondary", fontSize: "1rem" }}>
            Please select the reason for subtracting reputation points. This action will deduct{" "}
            {selectedReason ? `${Math.abs(violationPoints[selectedReason] || 1)} point(s)` : "points"} from the
            student's reputation.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="reason-select-label" sx={{ color: "grey.700" }}>
              Violation Reason
            </InputLabel>
            <Select
              labelId="reason-select-label"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              label="Violation Reason"
              sx={{ mt: 1, "& .MuiSelect-select": { py: 1.5 } }}
            >
              <MenuItem value="Minor Violation">
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span>Minor Violation</span>
                  <Chip label="-1 point" color="warning" size="small" />
                </Box>
              </MenuItem>
              <MenuItem value="Violation">
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span>Violation</span>
                  <Chip label="-2 points" color="error" size="small" />
                </Box>
              </MenuItem>
              <MenuItem value="Serious Violation">
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span>Serious Violation</span>
                  <Chip label="-3 points" color="error" size="small" />
                </Box>
              </MenuItem>
              <MenuItem value="Other">
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span>Other</span>
                  <Chip label="-1 point" color="warning" size="small" />
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubtract}
            color="error"
            variant="contained"
            disabled={!selectedReason}
            sx={{ textTransform: "none", borderRadius: 1, px: 3 }}
          >
            Confirm 
          </Button>
        </DialogActions>
      </Dialog>

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

export default StudentInfoPage