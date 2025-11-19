import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const instance = axios.create({
    baseURL: `${API_BASE}/api`
});
instance.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

export default instance;
