import axios from "axios";
import { API_BASE_URL, clearStoredTokens, getStoredTokens, refreshToken, setStoredTokens } from "../services/authService";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((queueItem) => {
    if (error) {
      queueItem.reject(error);
    } else {
      queueItem.resolve(token);
    }
  });

  failedQueue = [];
}

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.headers?.Authorization) {
      return config;
    }

    const tokens = getStoredTokens();

    if (tokens?.accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest?._retry || originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

    const tokens = getStoredTokens();

    if (!tokens?.refreshToken) {
      clearStoredTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    isRefreshing = true;

    try {
      const refreshed = await refreshToken(tokens.refreshToken);
      setStoredTokens(refreshed);
      processQueue(null, refreshed.accessToken);
      originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearStoredTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;

