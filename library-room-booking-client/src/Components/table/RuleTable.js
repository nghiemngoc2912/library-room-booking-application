"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  TablePagination,
  Chip,
  Box,
  Tooltip,
  IconButton,
  Skeleton,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import VisibilityIcon from "@mui/icons-material/Visibility"
import AccessTimeIcon from "@mui/icons-material/AccessTime"

const RuleTable = ({ rules, onEdit, onDelete, loading = false }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "N/A"
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const getStatusChip = (status) => {
    const isActive = status === 1 || status === true
    return (
      <Chip
        label={isActive ? "Active" : "Inactive"}
        color={isActive ? "success" : "default"}
        size="small"
        variant={isActive ? "filled" : "outlined"}
      />
    )
  }

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Rules List
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rule Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={200} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={120} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Skeleton variant="rectangular" width={60} height={32} />
                      <Skeleton variant="rectangular" width={70} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )
  }

  if (rules.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" py={4}>
          <VisibilityIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No rules found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {rules.length === 0
              ? "Create your first rule to get started"
              : "Try adjusting your search or filter criteria"}
          </Typography>
        </Box>
      </Paper>
    )
  }

  const paginatedRules = rules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper elevation={3} sx={{ overflow: "hidden" }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Rules List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and organize your business rules
        </Typography>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="rules table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Rule Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRules.map((rule, index) => (
              <TableRow
                key={rule.id}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "grey.25" },
                  "&:hover": { backgroundColor: "action.hover" },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
                    {rule.ruleName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={rule.description || "No description"} arrow>
                    <Typography variant="body2" color="text.secondary">
                      {truncateText(rule.description)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{getStatusChip(rule.status)}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(rule.createAt)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Edit rule" arrow>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(rule)}
                        sx={{
                          "&:hover": { backgroundColor: "primary.light", color: "white" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete rule" arrow>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(rule)}
                        sx={{
                          "&:hover": { backgroundColor: "error.light", color: "white" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={rules.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "grey.50",
        }}
      />
    </Paper>
  )
}

export default RuleTable
