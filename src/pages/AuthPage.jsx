// frontend/src/pages/AuthPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import useAuth from '../hooks/useAuth';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const { isAuthenticated, login, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // HAPUS 'font-poppins' dari sini
      className="min-h-screen bg-primary-dark flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-8">
        <img 
          src="/my-company-logo.png" 
          alt="MondzStore Logo" // Ganti alt text
          className="h-24 w-auto mx-auto mb-4" 
        />
        
        {/* GANTI JUDUL */}
        <h1 className="text-4xl font-extrabold text-gacha-red text-center">Dashboard Admin</h1>
        <p className="text-center text-text-muted mt-2">Login untuk MondzStore</p>
      </div>
      <AuthForm onLogin={login} loading={loading} error={error} />
    </motion.div>
  );
};

export default AuthPage;