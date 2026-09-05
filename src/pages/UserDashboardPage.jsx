// src/pages/UserDashboardPage.jsx
import React from 'react';
import InvoiceForm from '../components/InvoiceForm'; // Ini akan menjadi form pembayaran baru
import { motion } from 'framer-motion';
import logo from '/my-company-logo.png'; // Impor logo dari folder public

const UserDashboardPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // Padding diatur ulang untuk mobile dan desktop
      className="min-h-screen bg-primary-dark text-text-light p-4 md:p-10"
    >
      {/* Container dibuat lebih lebar (max-w-5xl) untuk 5 opsi pembayaran */}
      <div className="max-w-5xl mx-auto">
        
        {/* --- LOGO MONDZSTORE DITAMBAHKAN DI SINI --- */}
        <img
          src={logo} // Gunakan logo yang diimpor
          alt="Mondzstore Logo"
          className="w-32 sm:w-40 mx-auto mb-6" // Sesuaikan ukuran logo jika perlu
        />
        {/* --- AKHIR LOGO --- */}
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gacha-red mb-4">
          Lakukan Pembayaran Gacha
        </h1>
        <p className="text-center text-text-muted mb-8 max-w-2xl mx-auto">
          Pembayaran gacha sebesar **Rp 50.000,-**.
          Silakan isi email, pilih metode, lalu lakukan transfer.
          Klik konfirmasi untuk validasi via WhatsApp.
        </p>
        
        {/* Render komponen InvoiceForm yang sudah dirombak */}
        <InvoiceForm />
      </div>
    </motion.div>
  );
};

export default UserDashboardPage;