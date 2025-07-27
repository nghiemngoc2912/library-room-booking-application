import axios from "axios";

const REPORTS_API_BASE = "https://localhost:7238/api/reports";

export const getReportsList = async (params) => {
  const res = await axios.get(`${REPORTS_API_BASE}`, { params });
  return res.data;
};

export const createReport = async (report) => {
  const res = await axios.post(REPORTS_API_BASE, report);
  return res.data;
};

export const updateReport = async (report) => {
  const res = await axios.put(`${REPORTS_API_BASE}/${report.id}`, report);
  return res.data;
};

export const deleteReport = async (id) => {
  const res = await axios.delete(`${REPORTS_API_BASE}/${id}`);
  return res.data;
};

export const getReportById = async (id) => {
  const res = await axios.get(`${REPORTS_API_BASE}/${id}`);
  return res.data;
};

export const updateReportStatus = async (reportId, status) => {
  const res = await axios.put(`${REPORTS_API_BASE}/${reportId}`, { id: reportId, status });
  return res.data;
};

export const getReportTypesByUser = async (userId) => {
  const res = await axios.get(`${REPORTS_API_BASE}/user/${userId}/types`);
  return res.data;
};

export async function fetchSlots() {
  const res = await fetch("https://localhost:7238/api/Slot");
  if (!res.ok) throw new Error("Failed to fetch slots");
  return res.json();
}

export async function fetchSlotById(slotId) {
  const res = await fetch(`https://localhost:7238/api/Slot/${slotId}`);
  if (!res.ok) throw new Error("Failed to fetch slot");
  return res.json();
}