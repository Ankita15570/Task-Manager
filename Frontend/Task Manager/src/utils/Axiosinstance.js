import axios from "axios";
import { API_PATHS, BASE_URL } from "./ApiPath";

const Axiosinstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

Axiosinstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("Token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

Axiosinstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (
        error.response.status === 401 &&
        error.config?.url !== API_PATHS.AUTH.LOGIN
      ) {
        window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error("Internal Server Error Please try again later");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. please try again later");
    }
    return Promise.reject(error);
  },
);

export default Axiosinstance;
