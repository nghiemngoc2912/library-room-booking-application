"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { updateRule, getRuleById } from "../../api/Rules"
import RuleForm from "../../Components/form/RuleForm"
import { Button, Container, Typography, Box, Alert, Paper, Breadcrumbs, Link, Snackbar, Skeleton } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import HomeIcon from "@mui/icons-material/Home"
import EditIcon from "@mui/icons-material/Edit"

const EditRulePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rule, setRule] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const ruleId = location.state?.rule?.id

  useEffect(() => {
    if (ruleId) {
      const fetchRule = async () => {
        try {
          setFetchLoading(true)
          const ruleData = await getRuleById(ruleId)
          setRule({
            id: ruleData.id,
            ruleName: ruleData.ruleName,
            description: ruleData.description || "",
            status: ruleData.status ? 1 : 0,
            createAt: ruleData.createAt || new Date().toISOString(),
            userId: ruleData.userId || 1,
          })
        } catch (error) {
          setError("Failed to load rule data.")
          setSnackbar({
            open: true,
            message: "Failed to load rule data",
            severity: "error",
          })
        } finally {
          setFetchLoading(false)
        }
      }
      fetchRule()
    } else {
      setError("No rule ID provided")
      setFetchLoading(false)
    }
  }, [ruleId])

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
      await updateRule({
        id: rule.id,
        ruleName: rule.ruleName,
        description: rule.description,
        status: rule.status,
        createAt: rule.createAt,
        userId: rule.userId,
      })
      setSnackbar({
        open: true,
        message: `Rule "${rule.ruleName}" updated successfully`,
        severity: "success",
      })
      setTimeout(() => {
        navigate("/rules")
      }, 1500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update rule."
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

  if (fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Paper>
      </Container>
    )
  }

  if (!rule && !fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Back to Rules
            </Button>
          }
        >
          Rule not found or failed to load.
        </Alert>
      </Container>
    )
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
          <EditIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Edit Rule
        </Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
            Edit Rule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update the rule information below
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

        {rule && (
          <RuleForm rule={rule} onChange={handleChange} onSubmit={handleSubmit} loading={loading} isEdit={true} />
        )}
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

export default EditRulePage