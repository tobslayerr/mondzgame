// src/components/InvoiceForm.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import InfoModal from './modals/InfoModal';

// --- Komponen Pilihan Pembayaran ---
const PaymentOption = ({ method, logo, selected, onSelect, isActive }) => {
  const isSelected = selected === method;
  if (isActive === false) return null;

  return (
    <motion.div
      layout
      onClick={() => onSelect(method)}
      className={`payment-option group ${isSelected ? 'selected' : ''}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="payment-logo-container">
        {logo}
      </div>
    </motion.div>
  );
};

// --- Komponen Detail Pembayaran ---
const PaymentDetails = ({ method, email, amount, onSubmit, loading, paymentSettings, waNumber }) => {
  const currentSetting = paymentSettings[method] || {};
  const paymentTitle = method;
  const accountNumber = currentSetting.accountNumber || '-';
  const accountName = currentSetting.accountName || '-';
  const qrisImageUrl = currentSetting.imageUrl;

  const generateWAMessage = () => {
    const baseMessage = `Halo Admin, saya sudah melakukan pembayaran Gacha.\n\n` +
                        `Email: ${email}\n` +
                        `Jumlah: Rp ${amount.toLocaleString('id-ID')}\n` +
                        `Metode: ${paymentTitle}\n\n` +
                        `Mohon segera diproses, terima kasih.`;
    return encodeURIComponent(baseMessage);
  };
  
  const cleanWaNumber = waNumber ? waNumber.replace(/[^0-9+]/g, '') : '+6283117420946';
  const waLink = `https://wa.me/${cleanWaNumber.replace('+', '')}?text=${generateWAMessage()}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(waLink);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: 20 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="mt-6 p-5 bg-secondary-dark rounded-lg border border-gray-700"
    >
      <h3 className="text-xl font-bold text-gacha-gold mb-4 text-center">
        Detail Pembayaran: {paymentTitle}
      </h3>
      
      {method === 'QRIS' ? (
        <div className="text-center">
          <p className="text-text-light mb-3">Scan kode QR di bawah ini</p>
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-lg shadow-lg max-w-xs w-full flex items-center justify-center min-h-[200px]">
              {qrisImageUrl ? (
                <img
                  src={qrisImageUrl}
                  alt="QRIS Code"
                  className="w-full h-auto object-contain rounded"
                />
              ) : (
                <p className="text-gray-500 text-sm">QRIS belum diunggah oleh Admin</p>
              )}
            </div>
          </div>
          <p className="text-sm text-text-muted mt-3">{accountName}</p>
        </div>
      ) : (
        <div className="space-y-3 text-center max-w-md mx-auto">
          <p className="text-text-light text-lg">Nomor Virtual Account / Rekening:</p>
          <p className="font-bold text-white text-2xl sm:text-3xl tracking-wider bg-primary-dark p-3 rounded-lg border border-gray-600">
            {accountNumber}
          </p>
          <p className="text-text-light text-lg pt-2">{accountName}</p>
        </div>
      )}
      
      <p className="text-yellow-400 text-xs sm:text-sm mt-6 mb-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700 text-center">
        Setelah membayar, klik tombol di bawah untuk konfirmasi ke Admin via WhatsApp.
        Invoice Anda akan dibuat otomatis di sistem.
      </p>

      <form onSubmit={handleSubmit}>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="button-submit w-full"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : `Konfirmasi & Buka WhatsApp`}
        </motion.button>
      </form>
    </motion.div>
  );
};

// --- Komponen Utama ---
const InvoiceForm = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  
  // State untuk pilihan paket gacha (default Rp 50.000)
  const [selectedAmount, setSelectedAmount] = useState(50000);
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  const [paymentSettings, setPaymentSettings] = useState({});
  const [adminWaNumber, setAdminWaNumber] = useState('+6283117420946');
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '', type: 'info' });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [paymentRes, adminRes] = await Promise.all([
          API.get('/payment-settings'),
          API.get('/admin-settings')
        ]);

        if (paymentRes.data.success) {
          const settingsMap = {};
          paymentRes.data.data.forEach(item => {
            settingsMap[item.method] = item;
          });
          setPaymentSettings(settingsMap);
        }

        if (adminRes.data.success) {
          setAdminWaNumber(adminRes.data.data.whatsappAdminNumber);
        }
      } catch (err) {
        console.error('Gagal mengambil pengaturan:', err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const handleSubmit = async (waLink) => {
    if (!customerEmail || !selectedMethod) {
      setInfoModalContent({ title: 'Error', message: 'Harap isi Email Anda dan pilih Metode Pembayaran.', type: 'error' });
      setIsInfoModalOpen(true);
      return;
    }
    
    setLoading(true);

    try {
      window.open(waLink, '_blank');
    } catch (popupError) {
      console.error("Gagal membuka WA:", popupError);
      setInfoModalContent({ title: 'Error', message: 'Gagal membuka WhatsApp. Pastikan pop-up di browser Anda diizinkan.', type: 'error' });
      setIsInfoModalOpen(true);
      setLoading(false);
      return;
    }
    
    try {
      await API.post('/user/invoice', { 
        customerEmail,
        grossAmount: selectedAmount,
        paymentMethod: selectedMethod
      });
      
      setCustomerEmail('');
      setSelectedMethod(null);
      setInfoModalContent({ title: 'Sukses', message: 'Invoice Anda sedang dibuat. Silakan selesaikan konfirmasi di WhatsApp.', type: 'success' });
      setIsInfoModalOpen(true);

    } catch (err) {
      console.error('Gagal membuat invoice:', err.response?.data || err.message);
      setInfoModalContent({ title: 'Gagal', message: 'Gagal membuat invoice di sistem, tapi Anda bisa lanjut konfirmasi di WhatsApp.', type: 'error' });
      setIsInfoModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary-dark p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700">
      
      {/* --- Instruksi Pembayaran Dinamis --- */}
      <div className="mb-8 p-4 bg-gray-800/60 border border-gray-700 rounded-lg text-center shadow-inner">
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Pembayaran gacha sebesar <strong className="text-yellow-400 font-bold text-lg">Rp {selectedAmount.toLocaleString('id-ID')}</strong>. 
          Silakan isi email, pilih metode, lalu lakukan transfer. Klik konfirmasi untuk validasi via WhatsApp.
        </p>
      </div>

      {/* 1. Input Email */}
      <div className="mb-6">
          <label className="input-label" htmlFor="email">
            1. Masukkan Email Anda
          </label>
          <input
            type="email"
            id="email"
            className="input-field mt-1"
            placeholder="email@anda.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
          />
      </div>

      {/* 2. Pilihan Nominal Harga Gacha */}
      <div className="mb-6">
        <label className="input-label mb-3">
          2. Pilih Nominal Gacha
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[50000, 100000, 150000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setSelectedAmount(amount)}
              className={`p-4 rounded-lg border text-center transition-all ${
                selectedAmount === amount 
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-bold shadow-md' 
                  : 'border-gray-600 bg-primary-dark text-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-base sm:text-lg font-semibold">Rp {amount.toLocaleString('id-ID')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Pilih Metode Pembayaran */}
      <div>
        <label className="input-label mb-3">
          3. Pilih Metode Pembayaran (Rp {selectedAmount.toLocaleString('id-ID')})
        </label>
        
        {settingsLoading ? (
          <div className="text-center py-4 text-gray-400">Memuat metode pembayaran...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            <PaymentOption method="GOPAY" logo={<img src="/logo-gopay.png" alt="Gopay" className="payment-logo-img" />} selected={selectedMethod} onSelect={setSelectedMethod} isActive={paymentSettings['GOPAY']?.isActive} />
            <PaymentOption method="BCA" logo={<img src="/logo-bca.png" alt="BCA" className="payment-logo-img" />} selected={selectedMethod} onSelect={setSelectedMethod} isActive={paymentSettings['BCA']?.isActive} />
            <PaymentOption method="SEABANK" logo={<img src="/logo-seabank.png" alt="Seabank" className="payment-logo-img" />} selected={selectedMethod} onSelect={setSelectedMethod} isActive={paymentSettings['SEABANK']?.isActive} />
            <PaymentOption method="OVO" logo={<img src="/logo-ovo.png" alt="OVO" className="payment-logo-img" />} selected={selectedMethod} onSelect={setSelectedMethod} isActive={paymentSettings['OVO']?.isActive} />
            <PaymentOption method="QRIS" logo={<img src="/logo-qris.png" alt="QRIS" className="payment-logo-img" />} selected={selectedMethod} onSelect={setSelectedMethod} isActive={paymentSettings['QRIS']?.isActive} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMethod && (
          <PaymentDetails
            method={selectedMethod}
            email={customerEmail}
            amount={selectedAmount}
            onSubmit={handleSubmit}
            loading={loading}
            paymentSettings={paymentSettings}
            waNumber={adminWaNumber}
          />
        )}
      </AnimatePresence>

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={infoModalContent.title}
        message={infoModalContent.message}
        type={infoModalContent.type}
      />
    </div>
  );
};

// --- STYLING TAMBAHAN ---
const styles = `
  .input-label { display: block; color: #bdc3c7; font-size: 0.9rem; font-weight: 500; }
  .input-field { display: block; width: 100%; padding: 0.65rem 1rem; border-radius: 0.5rem; background-color: #1a1a2e; color: #ecf0f1; border: 1px solid #4a4a6e; outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-size: 0.95rem; }
  .input-field::placeholder { color: #5a5a7e; }
  .input-field:focus { border-color: #e74c3c; box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3); }
  .button-submit { background-color: #27ae60; color: white; font-weight: 600; padding: 0.7rem 1.5rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: background-color 0.2s; border: none; cursor: pointer; }
  .button-submit:hover:not(:disabled) { background-color: #229954; }
  .button-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .payment-option { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem 0.75rem; border: 2px solid #4a4a6e; background-color: #1a1a2e; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s ease-in-out; min-height: 80px; }
  .payment-option:hover { border-color: #7f8c8d; transform: translateY(-2px); }
  .payment-option.selected { border-color: #f1c40f; background-color: rgba(241, 196, 15, 0.05); box-shadow: 0 0 15px rgba(241, 196, 15, 0.2); transform: scale(1.05); }
  .payment-logo-container { display: flex; align-items: center; justify-content: center; height: 2.5rem; width: 100%; }
  .payment-logo-img { height: 100%; width: auto; max-width: 90%; object-fit: contain; }
`;

const styleId = 'invoice-form-styles-dynamic';
if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

export default InvoiceForm;