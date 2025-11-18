import axios from "./axios";


export const registerUser = async(userData) => {
    return await axios.post("/users/register", userData);
};

export const loginUser = async(userData) => {
    return await axios.post("/users/login", userData);
};

export const logoutUser = async() => {
    return await axios.post("/users/logout");
};