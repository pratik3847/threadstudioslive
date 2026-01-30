import axios from 'axios';

const normalizeApiUrl = (raw) => {
    const cleaned = String(raw || '').trim().replace(/\/$/, '');
    if (!cleaned) return '';
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

// In production, if VITE_API_URL isn't set, prefer same-origin `/api` (Vercel rewrite)
// instead of defaulting to localhost (which breaks in the browser).
const RAW_API_URL = import.meta.env.VITE_API_URL;
const API_URL = RAW_API_URL
    ? normalizeApiUrl(RAW_API_URL)
    : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Exported for pages that need to build absolute OAuth redirect URLs.
export const API_BASE_URL = API_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            if (config.headers && typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                config.headers = {
                    ...(config.headers || {}),
                    Authorization: `Bearer ${token}`
                };
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const status = error.response?.status;
        const errorCode = error.response?.data?.code;

        // Our backend uses:
        // - 401 for missing token / user not found
        // - 403 for expired/invalid token
        const shouldAttemptRefresh =
            status === 401 ||
            (status === 403 && (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN'));

        // If auth failed and we haven't tried refreshing yet
        if (shouldAttemptRefresh && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Ensure subsequent requests include the new token
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

                if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
                    originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
                } else {
                    originalRequest.headers = {
                        ...(originalRequest.headers || {}),
                        Authorization: `Bearer ${accessToken}`
                    };
                }
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/change-password', data)
};

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

// Orders API
export const ordersAPI = {
    create: (data) => api.post('/orders', data),
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { cancelReason: reason }),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data)
};

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    getAllOrders: (params) => api.get('/orders/admin/all', { params })
};

const encodePublicIdForUrl = (publicId) => encodeURIComponent(String(publicId).replace(/\//g, '_'));

// Upload API (Cloudinary via backend)
export const uploadAPI = {
    uploadSingleImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    uploadMultipleImages: (files) => {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('images', file));
        return api.post('/upload/upload-multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteImage: (publicId) => api.delete(`/upload/delete/${encodePublicIdForUrl(publicId)}`)
};

export default api;
