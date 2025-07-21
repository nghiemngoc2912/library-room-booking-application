"use client"
import {
  Button,
  TextField,
  MenuItem,
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import AddIcon from "@mui/icons-material/Add"

const RuleForm = ({ rule, onChange, onSubmit, loading = false, isEdit = false }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  const getCharacterCount = () => {
    return rule.description ? rule.description.length : 0
  }

  const isDescriptionTooLong = () => {
    return getCharacterCount() > 500
  }

  const isFormValid = () => {
    return rule.ruleName.trim().length >= 3 && !isDescriptionTooLong()
  }

  return (
    <Container maxWidth="sm" sx={{ p: 0 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Rule Name Field */}
          <TextField
            label="Rule Name"
            name="ruleName"
            value={rule.ruleName}
            onChange={onChange}
            fullWidth
            required
            error={rule.ruleName.length > 0 && rule.ruleName.length < 3}
            helperText={
              rule.ruleName.length > 0 && rule.ruleName.length < 3
                ? "Rule name must be at least 3 characters"
                : "Enter a descriptive name for your rule"
            }
            disabled={loading}
            InputProps={{
              endAdornment: rule.ruleName.length >= 3 && <Chip label="✓" color="success" size="small" />,
            }}
          />

          {/* Description Field */}
          <Box>
            <TextField
              label="Description"
              name="description"
              value={rule.description}
              onChange={onChange}
              fullWidth
              multiline
              rows={4}
              error={isDescriptionTooLong()}
              helperText={`${getCharacterCount()}/500 characters`}
              disabled={loading}
              placeholder="Enter a detailed description of what this rule does (optional)"
            />
            {isDescriptionTooLong() && (
              <FormHelperText error>Description is too long. Please keep it under 500 characters.</FormHelperText>
            )}
          </Box>

          {/* Status Field */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Rule Status
              </Typography>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={rule.status} onChange={onChange} label="Status">
                  <MenuItem value={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label="Active" color="success" size="small" />
                      <span>Active - Rule is currently in use</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value={0}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label="Inactive" color="default" size="small" />
                      <span>Inactive - Rule is disabled</span>
                    </Box>
                  </MenuItem>
                </Select>
                <FormHelperText>
                  {rule.status === 1 || rule.status === true
                    ? "This rule is currently active and will be applied"
                    : "This rule is inactive and will not be applied"}
                </FormHelperText>
              </FormControl>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Box sx={{ pt: 2 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading || !isFormValid()}
              startIcon={loading ? null : isEdit ? <SaveIcon /> : <AddIcon />}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: "2px solid",
                      borderColor: "currentColor",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                  {isEdit ? "Updating Rule..." : "Creating Rule..."}
                </Box>
              ) : isEdit ? (
                "Update Rule"
              ) : (
                "Create Rule"
              )}
            </Button>

            {!isFormValid() && (
              <FormHelperText error sx={{ textAlign: "center", mt: 1 }}>
                Please fill in all required fields correctly to continue
              </FormHelperText>
            )}
          </Box>
        </Box>
      </form>
    </Container>
  )
}

export default RuleForm
