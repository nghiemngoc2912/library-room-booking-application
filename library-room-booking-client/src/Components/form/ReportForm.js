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
  Chip,
  LinearProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";

const ReportForm = ({ report, onChange, onSubmit, loading = false, isEdit = false, slots = [], rooms = [], loadingRooms = false }) => {
  const [localRooms, setLocalRooms] = useState(rooms);

  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const getCharacterCount = () => {
    return report.description ? report.description.length : 0;
  };

  const isDescriptionTooLong = () => {
    return getCharacterCount() > 1000;
  };

  const isFormValid = () => {
    return (
      report.reportType.trim().length >= 3 &&
      !isDescriptionTooLong() &&
      rooms.some((room) => room.id === report.roomId) &&
      slots.some((slot) => slot.id === report.slotId)
    );
  };

  const reportTypes = [
    "Noise Complaint",
    "Damage Report",
    "Safety Concern",
    "Maintenance Issue",
    "Behavioral Issue",
    "Other",
  ];

  return (
    <Container maxWidth="sm" sx={{ p: 0 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Report Type Field */}
          <FormControl fullWidth required error={report.reportType.length > 0 && report.reportType.length < 3}>
            <InputLabel>Report Type</InputLabel>
            <Select
              name="reportType"
              value={report.reportType}
              onChange={onChange}
              label="Report Type"
              disabled={loading}
            >
              {reportTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {report.reportType.length > 0 && report.reportType.length < 3
                ? "Report type must be at least 3 characters"
                : "Select the type of report you want to create"}
            </FormHelperText>
          </FormControl>

          {/* Room Selection */}
          <FormControl fullWidth required error={!rooms.some((room) => room.id === report.roomId)}>
            <InputLabel>Room</InputLabel>
            <Select
              name="roomId"
              value={report.roomId || ""}
              onChange={onChange}
              label="Room"
              disabled={loadingRooms || loading || rooms.length === 0}
            >
              {loadingRooms ? (
                <MenuItem value="">
                  <em>Loading rooms...</em>
                </MenuItem>
              ) : rooms.length === 0 ? (
                <MenuItem value="" disabled>
                  <em>No rooms available</em>
                </MenuItem>
              ) : (
                rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.roomName}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {!rooms.some((room) => room.id === report.roomId)
                ? "A valid room is required"
                : "Select the room where the incident occurred"}
            </FormHelperText>
          </FormControl>

          {/* Slot Selection */}
          <FormControl fullWidth required error={!slots.some((slot) => slot.id === report.slotId)}>
            <InputLabel>Time Slot</InputLabel>
            <Select
              name="slotId"
              value={report.slotId || ""}
              onChange={onChange}
              label="Time Slot"
              disabled={loading || slots.length === 0}
            >
              {slots.length === 0 ? (
                <MenuItem value="" disabled>
                  <em>No slots available</em>
                </MenuItem>
              ) : (
                slots.map((slot) => (
                  <MenuItem key={slot.id} value={slot.id}>
                    {`${slot.fromTime} - ${slot.toTime}`}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {!slots.some((slot) => slot.id === report.slotId)
                ? "A valid time slot is required"
                : "Select the time slot for the incident"}
            </FormHelperText>
          </FormControl>

          {/* Description Field */}
          <Box>
            <TextField
              label="Description"
              name="description"
              value={report.description}
              onChange={onChange}
              fullWidth
              multiline
              rows={4}
              error={isDescriptionTooLong()}
              helperText={`${getCharacterCount()}/1000 characters`}
              disabled={loading}
              placeholder="Provide detailed information about the incident or issue (optional)"
            />
            {isDescriptionTooLong() && (
              <FormHelperText error>Description is too long. Please keep it under 1000 characters.</FormHelperText>
            )}
          </Box>

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
              sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}
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
                  {isEdit ? "Updating Report..." : "Creating Report..."}
                </Box>
              ) : isEdit ? (
                "Update Report"
              ) : (
                "Create Report"
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
  );
};

export default ReportForm;