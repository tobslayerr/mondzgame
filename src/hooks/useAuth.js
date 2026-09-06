// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.post('/auth/login', { email, password });
            const newToken = res.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setIsAuthenticated(true);
            return true; 
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
            setIsAuthenticated(false);
            return false; 
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        // 1. Hapus token admin utama
        localStorage.removeItem('token');
        
        // 2. Hapus token superadmin (keamanan lapis kedua)
        sessionStorage.removeItem('superadminToken');
        
        setToken(null);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [token]);

    return { token, isAuthenticated, login, logout, loading, error };
};

export default useAuth;