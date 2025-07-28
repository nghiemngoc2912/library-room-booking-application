import axios from "axios";

const REPORTS_API_BASE = "https://localhost:7238/api/reports";

// Tạo một axios instance dùng chung, bật sẵn withCredentials
const axiosInstance = axios.create({
  baseURL: REPORTS_API_BASE,
  withCredentials: true,
});

export const getReportsList = async (params) => {
  const res = await axiosInstance.get("", { params });
  return res.data;
};

export const createReport = async (report) => {
  const res = await axiosInstance.post("", report);
  return res.data;
};

export const updateReport = async (report) => {
  const res = await axiosInstance.put(`/${report.id}`, report);
  return res.data;
};

export const deleteReport = async (id) => {
  const res = await axiosInstance.delete(`/${id}`);
  return res.data;
};

export const getReportById = async (id) => {
  const res = await axiosInstance.get(`/${id}`);
  return res.data;
};

export const updateReportStatus = async (reportId, status) => {
  const res = await axiosInstance.put(`/${reportId}`, {
    id: reportId,
    status,
  });
  return res.data;
};

export const getReportTypesByUser = async (userId) => {
  const res = await axiosInstance.get(`/user/${userId}/types`);
  return res.data;
};

// Với fetch: thêm credentials: 'include'
export async function fetchSlots() {
  const res = await fetch("https://localhost:7238/api/Slot", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch slots");
  return res.json();
}

export async function fetchSlotById(slotId) {
  const res = await fetch(`https://localhost:7238/api/Slot/${slotId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch slot");
  return res.json();
}
