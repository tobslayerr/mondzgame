// frontend/src/components/AuthForm.jsx
import React, { useState, useEffect } from 'react';

const AuthForm = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load data dari LocalStorage jika user sebelumnya mencentang "Simpan info login"
  useEffect(() => {
    const savedEmail = localStorage.getItem('mondz_saved_email');
    const savedPassword = localStorage.getItem('mondz_saved_password');
    const isRemembered = localStorage.getItem('mondz_remember_me') === 'true';

    if (isRemembered) {
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Logika menyimpan informasi login
    if (rememberMe) {
      localStorage.setItem('mondz_saved_email', email);
      localStorage.setItem('mondz_saved_password', password);
      localStorage.setItem('mondz_remember_me', 'true');
    } else {
      localStorage.removeItem('mondz_saved_email');
      localStorage.removeItem('mondz_saved_password');
      localStorage.setItem('mondz_remember_me', 'false');
    }

    onLogin(email, password);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        
        {/* Input Email */}
        <div>
          <label className="block text-text-muted text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-600 rounded-md bg-primary-dark text-white focus:outline-none focus:border-gacha-red transition-colors"
            placeholder="admin@email.com"
          />
        </div>

        {/* Input Password */}
        <div>
          <label className="block text-text-muted text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-primary-dark text-white focus:outline-none focus:border-gacha-red transition-colors pr-12"
              placeholder="********"
            />
            {/* Tombol Toggle View Password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-text-muted hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? (
                // Mata Terbuka
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                // Mata Dicoret
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Checkbox Simpan Info Login */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-primary-dark text-gacha-red focus:ring-gacha-red cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted cursor-pointer select-none">
            Simpan info login
          </label>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gacha-red hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-md focus:outline-none transition-colors"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;