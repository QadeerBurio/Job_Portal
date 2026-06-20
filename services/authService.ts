import axios from "axios";

const API_URL = "http://192.168.100.4:5000/api";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
  });

  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });

  return res.data;
};
