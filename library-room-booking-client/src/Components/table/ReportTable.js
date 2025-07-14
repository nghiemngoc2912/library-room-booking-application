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
import InfoIcon from "@mui/icons-material/Info"
import VisibilityIcon from "@mui/icons-material/Visibility"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import PersonIcon from "@mui/icons-material/Person"
import RoomIcon from "@mui/icons-material/Room"
import EditIcon from "@mui/icons-material/Edit"

const ReportTable = ({ reports, onDetail, onStatusChange, loading = false }) => {
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
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
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
        size="small"
        variant={isReplied ? "filled" : "outlined"}
      />
    )
  }

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "N/A"
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Reports List
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={100} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={70} height={32} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )
  }

  if (reports.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" py={4}>
          <VisibilityIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No reports found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {reports.length === 0
              ? "Create your first report to get started"
              : "Try adjusting your search or filter criteria"}
          </Typography>
        </Box>
      </Paper>
    )
  }

  const paginatedReports = reports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper elevation={3} sx={{ overflow: "hidden" }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Reports List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor and manage student reports
        </Typography>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="reports table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Report ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Room</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Sending Date</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.map((report, index) => (
              <TableRow
                key={report.id}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "grey.25" },
                  "&:hover": { backgroundColor: "action.hover" },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
                    #{report.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2">{report.userName || "N/A"}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <RoomIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2">{report.roomId || "N/A"}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={truncateText(report.reportType)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ maxWidth: 120 }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(report.createAt)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{getStatusChip(report.status)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="View details" arrow>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onDetail(report)}
                        sx={{
                          "&:hover": { backgroundColor: "primary.light", color: "white" },
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Change status" arrow>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => onStatusChange(report)}
                        sx={{
                          "&:hover": { backgroundColor: "secondary.light", color: "white" },
                        }}
                        disabled={!onStatusChange} // Ngăn chặn nếu prop không được truyền
                      >
                        <EditIcon fontSize="small" />
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
        count={reports.length}
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

export default ReportTable