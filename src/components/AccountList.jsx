// frontend/src/components/AccountList.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PaginatedAccountSection from './PaginatedAccountSection';

const AccountList = () => {
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);

  const handleActionSuccess = () => {
    setInternalRefreshTrigger(prevCount => prevCount + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-secondary-dark p-6 rounded-xl shadow-xl border border-gray-700"
    >
      <h3 className="text-2xl font-bold text-center text-gacha-red mb-6 sm:mb-8">
        Manajemen Akun
      </h3>

      {/* HANYA TAMPILKAN AKUN TERSEDIA */}
      <PaginatedAccountSection
        title="Akun Tersedia"
        statusQuery="available" // Hanya status ini yang akan diambil
        refreshTrigger={internalRefreshTrigger}
        showActions={true} // Admin tetap bisa menghapus akun dari sini
        onActionSuccess={handleActionSuccess}
      />

      {/* --- Bagian "Akun Diklaim" dan "Akun Dirilis" DIHAPUS --- */}
      
    </motion.div>
  );
};

export default AccountList;
