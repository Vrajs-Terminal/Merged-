import axios from 'axios';
import { useNotificationStore } from '../store/useNotificationStore';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to refresh notifications on successful write operations
api.interceptors.response.use((response) => {
    const method = response.config.method?.toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(method || '')) {
        // Trigger a background refresh of notifications with a small delay
        // to ensure the backend has finished committing the ActivityLog
        setTimeout(() => {
            useNotificationStore.getState().refresh();
        }, 500);
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});

export default api;
