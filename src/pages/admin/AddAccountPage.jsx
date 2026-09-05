import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// Helper styling radio button (dengan warna baru dan hover effect)
const TierOption = ({ value, label, checked, onChange, colorClass, hoverColorClass }) => (
  <label className={`
    flex-1 relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out transform
    ${checked
      ? `${colorClass} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-offset-secondary-dark ring-current` // Ring saat checked
      : `bg-primary-dark border-secondary-dark text-text-muted hover:border-gray-500 ${hoverColorClass}` // Hover effect
    }
  `}>
    <input
      type="radio"
      name="tier"
      value={value}
      checked={checked}
      onChange={onChange}
      className="absolute opacity-0 w-0 h-0 peer" // Peer untuk styling label saat checked
    />
    {/* Gaya teks diperhalus */}
    <span className={`
      font-semibold text-center block text-sm sm:text-base tracking-wide
      ${checked ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}
    `}>
      {label}
    </span>
  </label>
);


const AddAccountPage = () => {
  // Gunakan default {} jika context null untuk menghindari error
  const { triggerRefresh } = useOutletContext() || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState('Nova'); // Default 'Nova'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      const endpoint = '/admin/accounts/add';
      const res = await API.post(endpoint, { email, password, tier });
      setMessage(res.data.msg);
      // Reset form
      setEmail(''); setPassword(''); setTier('Nova');
      // Panggil refresh jika fungsi tersedia
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      // Tampilkan pesan error yang lebih deskriptif
      setError(err.response?.data?.msg || `Gagal menambah akun. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Properti animasi untuk container
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Properti animasi untuk tombol submit
  const buttonVariants = {
    hover: { scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 15 } },
    tap: { scale: 0.97 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      // Layout utama: tengahkan form, batasi lebar, padding responsif
      className="max-w-xl mx-auto px-4"
    >
      <div className="bg-secondary-dark p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-gacha-red mb-6 sm:mb-8">
          Tambah Akun Baru
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Jarak antar elemen form */}

          {/* Pemilihan Tier */}
          <div>
            <label className="input-label mb-3">Tipe Akun (Tier)</label>
            {/* Grid 2 kolom, gap diperbesar */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <TierOption value="Nova" label="Nova" checked={tier === 'Nova'} onChange={(e) => setTier(e.target.value)} colorClass="bg-blue-600 border-blue-400" hoverColorClass="hover:bg-blue-900/30"/>
              <TierOption value="Pulse" label="Pulse" checked={tier === 'Pulse'} onChange={(e) => setTier(e.target.value)} colorClass="bg-green-600 border-green-400" hoverColorClass="hover:bg-green-900/30"/>
              <TierOption value="Flux" label="Flux" checked={tier === 'Flux'} onChange={(e) => setTier(e.target.value)} colorClass="bg-yellow-600 border-yellow-400" hoverColorClass="hover:bg-yellow-900/30"/>
              <TierOption value="Radiant" label="Radiant" checked={tier === 'Radiant'} onChange={(e) => setTier(e.target.value)} colorClass="bg-red-600 border-red-400" hoverColorClass="hover:bg-red-900/30"/>
            </div>
          </div>

          {/* Input Email */}
          <div>
            <label className="input-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input-field mt-1" // Margin top ditambahkan
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <input
              type="text" // Tetap text agar mudah dilihat admin saat input
              id="password"
              className="input-field mt-1"
              placeholder="Masukkan password akun"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Pesan Sukses/Error */}
          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-green-400 text-sm text-center font-medium bg-green-900/30 p-3 rounded-md"
              >
                {message}
              </motion.p>
            )}
            {error && (
               <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-sm text-center font-medium bg-red-900/30 p-3 rounded-md"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Tombol Submit */}
          <motion.button
            type="submit"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="button-submit w-full mt-4" // Margin top ditambahkan
            disabled={loading}
          >
            {loading ? <LoadingSpinner className="text-white h-5 w-5" /> : `Tambah Akun`}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

// --- STYLING TAMBAHAN (Suntikkan atau pindahkan ke file CSS) ---
const styles = `
  .input-label { display: block; color: #bdc3c7; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
  .input-field { display: block; width: 100%; padding: 0.75rem 1rem; border-radius: 0.5rem; background-color: #1a1a2e; color: #ecf0f1; border: 1px solid #4a4a6e; outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-size: 0.95rem; }
  .input-field::placeholder { color: #5a5a7e; }
  .input-field:focus { border-color: #e74c3c; box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3); }
  .button-submit { background-color: #e74c3c; color: white; font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: background-color 0.2s; }
  .button-submit:hover:not(:disabled) { background-color: #c0392b; }
  .button-submit:disabled { opacity: 0.6; cursor: not-allowed; }
`;
// Suntikkan style ke head (Cara sederhana untuk demo)
const styleElement = document.getElementById('add-account-styles') || document.createElement("style");
styleElement.id = 'add-account-styles';
if (!styleElement.isConnected) {
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

export default AddAccountPage;