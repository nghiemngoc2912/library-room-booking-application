import axios from 'axios';

// ✅ Sử dụng fetch với credentials: 'include'
export async function fetchStudents(keyword = '', page = 1) {
  const res = await fetch(`https://localhost:7238/api/user/students?keyword=${encodeURIComponent(keyword)}&page=${page}`, {
    credentials: 'include' // ✅ Thêm dòng này để gửi cookie/session
  });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

// ✅ Sử dụng axios với withCredentials: true
export const getStudentList = (keyword = '', page = 1) => {
  return axios.get('https://localhost:7238/api/user/students', {
    params: { keyword, page },
    withCredentials: true // ✅ Cho phép gửi cookie
  });
};

export const getUserReputation = async (userId) => {
  const res = await axios.get(`https://localhost:7238/api/user/${userId}/reputation`, {
    withCredentials: true // ✅ Đảm bảo gửi kèm thông tin phiên đăng nhập
  });
  return res.data;
};
