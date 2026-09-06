import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL, 
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use(
    (config) => {
        // 1. Token Admin Utama (dari localStorage)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token; 
        }

        // 2. Token Superadmin / Keamanan Lapis Kedua (dari sessionStorage)
        const superadminToken = sessionStorage.getItem('superadminToken');
        if (superadminToken) {
            config.headers['Authorization'] = `Bearer ${superadminToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Jika sesi habis (Unauthorized), hapus semua token untuk keamanan
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('superadminToken');
        }
        return Promise.reject(error);
    }
);

export default API;