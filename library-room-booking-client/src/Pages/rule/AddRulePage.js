"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createRule } from "../../api/Rules"
import RuleForm from "../../Components/form/RuleForm"
import { Button, Container, Typography, Box, Alert, Paper, Breadcrumbs, Link, Snackbar } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import HomeIcon from "@mui/icons-material/Home"
import AddIcon from "@mui/icons-material/Add"

const AddRulePage = () => {
  const navigate = useNavigate()
  const [rule, setRule] = useState({
    ruleName: "",
    description: "",
    status: 1,
    createAt: new Date().toISOString(),
    userId: 1,
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const validateRule = () => {
    if (!rule.ruleName.trim()) {
      setError("Rule name is required")
      return false
    }
    if (rule.ruleName.length < 3) {
      setError("Rule name must be at least 3 characters long")
      return false
    }
    if (rule.description && rule.description.length > 500) {
      setError("Description must be less than 500 characters")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError(null)
    if (!validateRule()) return
    setLoading(true)
    try {
      await createRule(rule)
      setSnackbar({
        open: true,
        message: `Rule "${rule.ruleName}" created successfully`,
        severity: "success",
      })
      setTimeout(() => {
        navigate("/rules")
      }, 1500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create rule."
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setRule({ ...rule, [name]: value })
    if (error) setError(null)
  }

  const handleBack = () => {
    navigate("/rules")
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          color="inherit"
          onClick={() => navigate("/rules")}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Rules
        </Link>
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          <AddIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Add New Rule
        </Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
            Add New Rule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a new business rule with the form below
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={loading}>
            Back to Rules
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <RuleForm rule={rule} onChange={handleChange} onSubmit={handleSubmit} loading={loading} isEdit={false} />
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
  )
}

export default AddRulePage