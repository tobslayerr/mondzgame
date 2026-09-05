import React, { useState } from 'react'; // <-- Import useState
import { motion } from 'framer-motion';
import PaginatedInvoiceSection from './PaginatedInvoiceSection'; 

// Hapus 'refreshTrigger' dari props, kita buat state internal
const InvoiceList = () => {
  
  // --- TAMBAHAN BARU ---
  // State untuk memicu refresh pada kedua komponen anak
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);

  // Fungsi ini akan dipanggil oleh anak ketika aksi (setujui/hapus) sukses
  // Ini akan memperbarui state, yang memicu kedua anak untuk me-reload
  const handleActionSuccess = () => {
    setInternalRefreshTrigger(prevCount => prevCount + 1);
  };
  // --- AKHIR TAMBAHAN ---

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // HAPUS 'mt-8' dari sini
      className="bg-secondary-dark p-6 rounded-lg shadow-xl border border-gacha-red"
    >
      <h3 className="text-2xl font-bold text-center text-gacha-red mb-6">
        Manajemen Invoice Pengguna
      </h3>
      
      <PaginatedInvoiceSection
        title="Invoice Menunggu Persetujuan"
        isPaid={false}
        refreshTrigger={internalRefreshTrigger} // <-- Pass state
        showActions={true}
        onActionSuccess={handleActionSuccess} // <-- Pass handler
      />
      
      <hr className="my-12 border-text-muted opacity-50" />
      
      <PaginatedInvoiceSection
        title="Invoice Lunas & Disetujui"
        isPaid={true}
        refreshTrigger={internalRefreshTrigger} // <-- Pass state
        showActions={false}
        onActionSuccess={handleActionSuccess} // <-- Pass handler (untuk konsistensi)
      />
      
    </motion.div>
  );
};

export default InvoiceList;