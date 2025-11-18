import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

export const registerUser = async(userData) => {
    return await axios.post(`${API_URL}/register`, userData, { withCredentials: true });
};

export const loginUser = async(userData) => {
    return await axios.post(`${API_URL}/login`, userData, { withCredentials: true });
};

export const logoutUser = async() => {
    return await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
};