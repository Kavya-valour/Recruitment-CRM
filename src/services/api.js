import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL, // uses env variable
});

export default api;
