import React from 'react';
import { motion } from 'framer-motion';
import InvoiceList from '../../components/InvoiceList';
// Hapus 'useOutletContext' karena tidak dipakai lagi di sini

const InvoicePage = () => {
  // Hapus 'triggerRefresh' dari context.
  // InvoiceList sekarang akan menangani pemicu refresh-nya sendiri.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Render InvoiceList tanpa prop 'refreshTrigger' */}
      <InvoiceList />
    </motion.div>
  );
};

export default InvoicePage;