import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

// Get auth config with token
const getAuthConfig = () => {
  const userString = localStorage.getItem("user");
  let token = null;
  
  if (userString) {
    try {
      const user = JSON.parse(userString);
      token = user.token;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all technicians
const getTechnicians = async () => {
  try {
    const response = await axios.get(`${API_URL}/technicians`, getAuthConfig());
    return response.data.technicians;
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

// Get all users
const getUsers = async () => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data.users;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error.response?.data?.message || error.message || "Error desconocido";
  }
};

const userService = {
  getTechnicians,
  getUsers,
};

export { userService };
