import axios from "axios";

// Determine the API base URL
const getBaseURL = () => {
    // Check environment variable first
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Default for local development - backend runs on port 5062
    return "http://localhost:5062/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;