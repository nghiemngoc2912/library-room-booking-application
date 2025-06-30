import axios from 'axios';


export const getUserReputation = async (userId) => {
  const res = await axios.get(`https://localhost:7238/api/User/2/reputation
`)
  return res.data;
};
