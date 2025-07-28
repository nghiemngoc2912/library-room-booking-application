import axios from 'axios';

const API_BASE = 'https://localhost:7238/api/news';

export const getNewsList = async (params) => {
  const res = await axios.get(`${API_BASE}/filter`, {
    params,
    withCredentials: true
  });
  return res.data;
};

export const createNews = async (news) => {
  const res = await axios.post(API_BASE, news, {
    withCredentials: true
  });
  return res.data;
};

export const updateNews = async (news) => {
  const res = await axios.put(API_BASE, news, {
    withCredentials: true
  });
  return res.data;
};

export const deleteNews = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`, {
    withCredentials: true
  });
  return res.data;
};

export const getNewsById = async (id) => {
  const res = await axios.get(`${API_BASE}/${id}`, {
    withCredentials: true
  });
  return res.data;
};
