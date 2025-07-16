import axios from 'axios';

const RULES_API_BASE = 'https://localhost:7238/api/Rules';

export const getRulesList = async (params) => {
  const res = await axios.get(`${RULES_API_BASE}`, { params });
  return res.data;
};

export const createRule = async (rule) => {
  const res = await axios.post(RULES_API_BASE, rule);
  return res.data;
};

export const updateRule = async (rule) => {
  const res = await axios.put(`${RULES_API_BASE}/${rule.id}`, rule);
  return res.data;
};

export const deleteRule = async (id) => {
  const res = await axios.delete(`${RULES_API_BASE}/${id}`);
  return res.data;
};

export const getRuleById = async (id) => {
  const res = await axios.get(`${RULES_API_BASE}/${id}`);
  return res.data;
};