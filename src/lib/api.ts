import axios from "axios";

const api = axios.create({
  baseURL: "https://reviewquality.mx/api", // cambia por tu URL base
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
