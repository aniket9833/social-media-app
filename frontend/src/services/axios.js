import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
instance.interceptors.request.use((axiosConfig) => {
  try {
    // Use sessionStorage to keep sessions isolated per tab
    const userData = sessionStorage.getItem("user_auth");
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.token) {
        axiosConfig.headers.Authorization = `Bearer ${parsedData.token}`;
      }
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
  return axiosConfig;
});

export default instance;
