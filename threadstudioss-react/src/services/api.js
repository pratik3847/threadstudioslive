import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
            config.headers.Authorization = `Bearer ${token}`;
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

        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
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

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
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
