import axios from 'axios';

const RULES_API_BASE = 'https://localhost:7238/api/Rules';

// Đảm bảo với mỗi request đều gửi kèm credentials
const axiosInstance = axios.create({
  baseURL: RULES_API_BASE,
  withCredentials: true,
});

export const getRulesList = async (params) => {
  const res = await axiosInstance.get('', { params });
  return res.data;
};

export const createRule = async (rule) => {
  const res = await axiosInstance.post('', rule);
  return res.data;
};

export const updateRule = async (rule) => {
  const res = await axiosInstance.put(`/${rule.id}`, rule);
  return res.data;
};

export const deleteRule = async (id) => {
  const res = await axiosInstance.delete(`/${id}`);
  return res.data;
};

export const getRuleById = async (id) => {
  const res = await axiosInstance.get(`/${id}`);
  return res.data;
};
