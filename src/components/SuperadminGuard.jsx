// frontend/src/components/SuperadminGuard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';

const SuperadminGuard = ({ children }) => {
  const [step, setStep] = useState('login'); // 'login', 'otp', 'verified'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State Timer
  const [timeLeft, setTimeLeft] = useState(0);

  // 1. Cek Sesi Saat Halaman Dimuat
  useEffect(() => {
    const token = sessionStorage.getItem('superadminToken');
    const expiry = sessionStorage.getItem('superadminExpiry');

    if (token && expiry) {
      const now = Date.now();
      if (now < parseInt(expiry, 10)) {
        setStep('verified');
        setTimeLeft(Math.floor((parseInt(expiry, 10) - now) / 1000));
      } else {
        handleLogout(); // Kedaluwarsa
      }
    }
  }, []);

  // 2. Jalankan Countdown Timer Jika Verified
  useEffect(() => {
    let timerInterval;
    if (step === 'verified' && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout(); // Waktu habis, logout paksa
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [step, timeLeft]);

  // Format Waktu ke Menit:Detik
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Fungsi Keluar / Logout Sesi Superadmin
  const handleLogout = () => {
    sessionStorage.removeItem('superadminToken');
    sessionStorage.removeItem('superadminExpiry');
    setStep('login');
    setPassword('');
    setOtp('');
    setError('');
  };

  // Request Login (Langkah 1)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/superadmin/login', { email, password });
      if (res.data.requiresOtp) {
        setStep('otp'); // Pindah ke form OTP
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  // Verifikasi OTP (Langkah 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/superadmin/verify-otp', { email, otp });
      if (res.data.success) {
        const expiresAt = Date.now() + res.data.expiresInMs; // 15 menit dari sekarang
        sessionStorage.setItem('superadminToken', res.data.superadminToken);
        sessionStorage.setItem('superadminExpiry', expiresAt.toString());
        
        setTimeLeft(Math.floor(res.data.expiresInMs / 1000));
        setStep('verified');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'OTP tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  // TAMPILAN JIKA SUDAH TERVERIFIKASI (Masa Akses 15 Menit)
  if (step === 'verified') {
    return (
      <div className="relative w-full">
        {/* HEADER KEAMANAN - Menempel di atas komponen anak */}
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div>
              <p className="text-white font-bold text-sm">Sesi Superadmin Aktif</p>
              <p className="text-red-300 font-mono text-xs">Sesi otomatis berakhir dalam: <span className="font-bold text-white text-sm">{formatTime(timeLeft)}</span></p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow transition-colors uppercase tracking-wider"
          >
            Tutup Pengaturan
          </button>
        </div>

        {/* Konten Halaman Pengaturan (Children) */}
        {children}
      </div>
    );
  }

  // TAMPILAN FORM (Login & OTP)
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-gray-900 border-2 border-red-900/50 rounded-xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4 border border-red-500/50 text-red-500">
            {step === 'login' ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">AREA TERBATAS</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            {step === 'login' 
              ? 'Otorisasi Superadmin diperlukan. Kegagalan 3 kali akan membekukan sistem.' 
              : 'Masukkan 6 digit OTP yang telah dikirim ke email sistem Anda.'}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-medium">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Email Khusus</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white outline-none" placeholder="Email Superadmin" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Sandi Keamanan</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white outline-none pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-white">
                  {showPassword ? <span className="text-xs">SEMBUNYIKAN</span> : <span className="text-xs">LIHAT</span>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={`w-full py-3.5 mt-4 rounded-lg text-white font-bold text-sm uppercase tracking-[0.15em] ${loading ? 'bg-gray-700' : 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]'}`}>
              {loading ? 'Memverifikasi...' : 'Lanjutkan Verifikasi'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">KODE OTP (6 DIGIT)</label>
              <input 
                type="text" 
                maxLength="6" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                required 
                className="w-full px-4 py-4 bg-black border-2 border-red-900/50 rounded-lg focus:border-red-500 text-white outline-none text-center text-3xl tracking-[0.5em] font-mono" 
                placeholder="000000" 
              />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className={`w-full py-3.5 mt-4 rounded-lg text-white font-bold text-sm uppercase tracking-[0.15em] ${(loading || otp.length < 6) ? 'bg-gray-700' : 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]'}`}>
              {loading ? 'Mengecek...' : 'Buka Pengaturan'}
            </button>
            <button type="button" onClick={() => setStep('login')} className="w-full py-2 text-gray-500 text-xs hover:text-white uppercase tracking-wider">
              &larr; Kembali
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SuperadminGuard;