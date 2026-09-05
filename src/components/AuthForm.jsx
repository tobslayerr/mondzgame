import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const AuthForm = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-secondary-dark p-8 rounded-lg shadow-xl max-w-md w-full"
    >
      <h2 className="text-3xl font-bold text-center text-gacha-red mb-6">Login Admin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-text-light text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-primary-dark border-secondary-dark focus:border-gacha-red"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-text-light text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline bg-primary-dark border-secondary-dark focus:border-gacha-red"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gacha-red hover:bg-gacha-red-dark text-white font-bold py-2 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner className="text-white h-5 w-5" /> : 'Login'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AuthForm;