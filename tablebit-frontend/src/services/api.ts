import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("tablebit_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("tablebit_token");
      if (token) {
        localStorage.removeItem("tablebit_token");
        localStorage.removeItem("tablebit_user");
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    return {
      message: data?.message || "Error inesperado",
      errors: data?.errors,
      status: error.response.status,
    };
  }
  return {
    message: "Error de conexión",
    status: 0,
  };
};

export default api;
