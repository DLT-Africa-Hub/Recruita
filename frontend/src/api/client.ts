import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authApi } from './auth';

const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL || 'http://localhost:3090/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getSessionToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return sessionStorage.getItem('token');
  } catch {
    return null;
  }
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return sessionStorage.getItem('refreshToken');
  } catch {
    return null;
  }
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      const currentPath = window.location.pathname;

      // Don't try to refresh if we're on login/register pages or no refresh token
      if (
        !refreshToken ||
        currentPath.includes('/login') ||
        currentPath.includes('/register')
      ) {
        isRefreshing = false;
        processQueue(error, null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');
        if (
          !currentPath.includes('/login') &&
          !currentPath.includes('/register')
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await authApi.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response;

        if (!accessToken) {
          throw new Error('No access token received from refresh');
        }

        // Update stored tokens
        sessionStorage.setItem('token', accessToken);
        if (newRefreshToken) {
          sessionStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        isRefreshing = false;
        processQueue(null, accessToken);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');

        // Only redirect if we're not already on the login/register page
        if (
          !currentPath.includes('/login') &&
          !currentPath.includes('/register')
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle email verification required - don't redirect, let frontend handle with modals
    // The modal will show on dashboard/assessment pages for unverified users
    // if (error.response?.status === 403 && error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
    //     const currentPath = window.location.pathname;
    //     if (!currentPath.includes('/verify-email')) {
    //         window.location.href = '/verify-email';
    //     }
    // }
    return Promise.reject(error);
  }
);

export default api;
