import axios from "axios";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes("/api/v1/auth/refresh") ||
      originalRequest?.url?.includes("/api/v1/auth/signin") ||
      originalRequest?.url?.includes("/api/v1/auth/signup");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post("/api/v1/auth/refresh");
        setAccessToken(res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
