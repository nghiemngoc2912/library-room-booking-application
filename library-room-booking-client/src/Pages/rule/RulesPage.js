"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getRulesList, deleteRule } from "../../api/Rules"
import RuleTable from "../../Components/table/RuleTable"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Paper,
  Chip,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import RefreshIcon from "@mui/icons-material/Refresh"

const RulesPage = () => {
  const navigate = useNavigate()
  const [rules, setRules] = useState([])
  const [filteredRules, setFilteredRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rule: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [error, setError] = useState(null)

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getRulesList()
      setRules(response)
      setFilteredRules(response)
    } catch (error) {
      console.error("Error fetching rules:", error)
      setError("Failed to load rules. Please try again.")
      setSnackbar({
        open: true,
        message: "Failed to load rules",
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  // Filter rules based on search term and status
  useEffect(() => {
    let filtered = rules

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (rule) =>
          rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((rule) => {
        if (statusFilter === "active") return rule.status === 1 || rule.status === true
        if (statusFilter === "inactive") return rule.status === 0 || rule.status === false
        return true
      })
    }

    setFilteredRules(filtered)
  }, [rules, searchTerm, statusFilter])

  const handleAddRule = () => {
    navigate("/add-rule")
  }

  const handleEditRule = (rule) => {
    navigate("/edit-rule", { state: { rule } })
  }

  const handleDeleteClick = (rule) => {
    setDeleteDialog({ open: true, rule })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.rule) return

    try {
      await deleteRule(deleteDialog.rule.id)
      setSnackbar({
        open: true,
        message: `Rule "${deleteDialog.rule.ruleName}" deleted successfully`,
        severity: "success",
      })
      fetchRules()
    } catch (error) {
      console.error("Error deleting rule:", error)
      setSnackbar({
        open: true,
        message: "Failed to delete rule",
        severity: "error",
      })
    } finally {
      setDeleteDialog({ open: false, rule: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, rule: null })
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleRefresh = () => {
    fetchRules()
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
            Loading rules...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error && rules.length === 0) {
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
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ fontWeight: "bold" }}>
          Rules Management
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Manage your business rules and configurations
        </Typography>
      </Box>

      {/* Action Bar */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search rules..."
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: "action.active" }} />}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={`${filteredRules.length} of ${rules.length} rules`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box display="flex" gap={1}>
              <Button variant="outlined" onClick={handleRefresh} disabled={loading} size="small">
                <RefreshIcon />
              </Button>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddRule} fullWidth>
                Add Rule
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Rules Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RuleTable rules={filteredRules} onEdit={handleEditRule} onDelete={handleDeleteClick} loading={loading} />
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: "error.main" }}>
          Delete Rule
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the rule "{deleteDialog.rule?.ruleName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
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

export default RulesPage
