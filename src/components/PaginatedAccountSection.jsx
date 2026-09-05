// src/components/PaginatedAccountSection.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import API from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { formatReadableDate, capitalizeFirstLetter } from '../utils/helpers';
import ConfirmationModal from './modals/ConfirmationModal';
import InfoModal from './modals/InfoModal';

const PaginatedAccountSection = ({ title, statusQuery, refreshTrigger, showActions, onActionSuccess = () => {} }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);

  // Filter state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tierQuery, setTierQuery] = useState('all');
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [appliedTierQuery, setAppliedTierQuery] = useState('all');

  // Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmActionArgs, setConfirmActionArgs] = useState({ id: null, type: null });
  const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '' });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '', type: 'info' });

  const showInfoModal = (title, message, type = 'info') => {
    setInfoModalContent({ title, message, type });
    setIsInfoModalOpen(true);
  };

  const fetchAccounts = useCallback(async (page, start, end, tier) => {
    setLoading(true); setError('');
    const params = { page, limit: 10, statusQuery }; // statusQuery akan 'available'
    if (start) params.startDate = start.toISOString();
    if (end) { const d = new Date(end); d.setHours(23, 59, 59, 999); params.endDate = d.toISOString(); }
    if (tier && tier !== 'all' && ['Nova', 'Pulse', 'Flux', 'Radiant'].includes(tier)) params.tierQuery = tier;
    try {
      const res = await API.get('/admin/accounts', { params });
      if (res.data?.accounts) {
        setAccounts(res.data.accounts); setTotalPages(res.data.totalPages || 1); setTotalAccounts(res.data.totalItems || 0); setCurrentPage(res.data.currentPage || 1);
      } else { setAccounts([]); setError('Format data tidak terduga.'); }
    } catch (err) { setError(err.response?.data?.msg || 'Gagal ambil data akun.'); setAccounts([]);
    } finally { setLoading(false); }
  }, [statusQuery]);

  // Execute Action (Hanya Hapus Permanen)
  const executeAccountAction = async ({ id: accountId, type: actionType }) => {
      setProcessingId(accountId);
      if (actionType === 'deletePermanent') {
        try {
          await API.delete(`/admin/accounts/${accountId}`);
          showInfoModal('Sukses', 'Akun berhasil dihapus permanen.', 'success');
          onActionSuccess(); // Trigger refresh di parent
        } catch (err) { showInfoModal('Error', `Gagal menghapus: ${err.response?.data?.msg || err.message}`, 'error');
        } finally { setProcessingId(null); }
      } else {
         console.warn("Aksi tidak diketahui:", actionType);
         setProcessingId(null);
      }
  };

  // Trigger Konfirmasi Aksi (Hanya Hapus Permanen)
  const handleAccountAction = (accountId, actionType) => {
    if (actionType === 'deletePermanent') {
        setConfirmActionArgs({ id: accountId, type: actionType });
        setConfirmModalContent({ title: 'Hapus Akun Permanen?', message: 'PERINGATAN: Tindakan ini tidak dapat dibatalkan!' });
        setIsConfirmModalOpen(true);
    }
  };

  useEffect(() => { fetchAccounts(currentPage, appliedStartDate, appliedEndDate, appliedTierQuery); }, [fetchAccounts, refreshTrigger, currentPage, appliedStartDate, appliedEndDate, appliedTierQuery]);

  const handleFilterApply = () => { setAppliedStartDate(startDate); setAppliedEndDate(endDate); setAppliedTierQuery(tierQuery); setCurrentPage(1); };
  const handleFilterReset = () => { setStartDate(null); setEndDate(null); setTierQuery('all'); setAppliedStartDate(null); setAppliedEndDate(null); setAppliedTierQuery('all'); setCurrentPage(1); };
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) setCurrentPage(newPage); };

  const getTierClass = (tier) => {
    switch (tier) {
      case 'Nova': return 'text-blue-400 border-blue-500 bg-blue-900/30';
      case 'Pulse': return 'text-green-400 border-green-500 bg-green-900/30';
      case 'Flux': return 'text-yellow-400 border-yellow-500 bg-yellow-900/30';
      case 'Radiant': return 'text-red-400 border-red-500 bg-red-900/30';
      default: return 'text-text-muted border-text-muted bg-gray-700/30';
    }
  };
  const getStatusColor = (status) => {
    return 'text-green-400'; // Selalu 'available'
  };

  const listVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex flex-wrap justify-between items-center gap-2 mt-6 text-text-light">
        <motion.button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pagination-button">
          Sebelumnya
        </motion.button>
        <span className="pagination-info">
          Halaman <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
        </span>
        <motion.button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pagination-button">
          Berikutnya
        </motion.button>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 sm:p-6 bg-primary-dark rounded-lg shadow-inner font-sans border border-secondary-dark">
      <h4 className="text-xl sm:text-2xl font-bold text-gacha-red mb-5">{title}</h4>
      <div className="p-4 bg-secondary-dark rounded-lg mb-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col"> <label className="filter-label">Tanggal Mulai</label> <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} placeholderText="Pilih tgl mulai" className="input-filter"/> </div>
          <div className="flex flex-col"> <label className="filter-label">Tanggal Akhir</label> <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} placeholderText="Pilih tgl akhir" className="input-filter"/> </div>
          <div className="flex flex-col"> <label className="filter-label">Filter Tier</label> <select value={tierQuery} onChange={(e) => setTierQuery(e.target.value)} className="input-filter select-filter"> <option value="all">Semua Tier</option> <option value="Nova">Nova</option> <option value="Pulse">Pulse</option> <option value="Flux">Flux</option> <option value="Radiant">Radiant</option> </select> </div>
          <div className="flex gap-2 w-full md:col-start-2 lg:col-start-4 justify-end pt-4 md:pt-0"> <motion.button onClick={handleFilterApply} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="button-gold flex-1 md:flex-none">Filter</motion.button> <motion.button onClick={handleFilterReset} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="button-silver flex-1 md:flex-none">Reset</motion.button> </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? <div className="loading-container"><LoadingSpinner size="h-10 w-10"/></div>
         : error ? <motion.p key="error" {...animProps} className="error-text">{error}</motion.p>
         : (
          <motion.div key="content" {...animProps} className="min-h-[192px]">
             {totalAccounts > 0 ? <p className="info-text">Total {totalAccounts} akun. Halaman {currentPage}/{totalPages}.</p>
             : <p className="info-text">Tidak ada akun ditemukan.</p>}
            <motion.ul variants={listVariants} initial="hidden" animate="show" className="account-list-container space-y-3">
              <AnimatePresence>
                {accounts.map((account) => (
                  <motion.li key={account._id} variants={itemVariants} layout className="account-item group">
                    <div className="account-info">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <p className="account-email">{account.email}</p>
                        <span className={`tier-badge ${getTierClass(account.tier)}`}>{account.tier || 'N/A'}</span>
                      </div>
                      <p className="account-detail">Pass: <span className="font-mono text-text-light group-hover:text-gacha-silver transition-colors">{account.password}</span></p>
                      <p className="account-detail">Status: <span className={`font-bold ${getStatusColor(account.status)}`}>{capitalizeFirstLetter(account.status.replace('_', ' '))}</span></p>
                      <p className="account-date">Dibuat: {formatReadableDate(account.createdAt)}</p>
                    </div>
                    {showActions && account.status === 'available' && ( // Hanya tampilkan jika status 'available'
                      <div className="account-actions">
                        <motion.button onClick={() => handleAccountAction(account._id, 'deletePermanent')} {...buttonAnimProps} className="button-action bg-gacha-red hover:bg-gacha-red-dark text-white" disabled={processingId === account._id} >{processingId === account._id ? <LoadingSpinner size="h-3 w-3" className="text-white" /> : 'Hapus'}</motion.button>
                      </div>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {renderPagination()}
          </motion.div>
        )}
      </AnimatePresence>

       <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={() => executeAccountAction(confirmActionArgs)} title={confirmModalContent.title} message={confirmModalContent.message}/>
       <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={infoModalContent.title} message={infoModalContent.message} type={infoModalContent.type}/>
    </motion.div>
  );
};

// --- STYLING TAMBAHAN ---
const styles = `
  /* ... (Semua class .filter-label, .input-filter, dll. tetap sama) ... */
  .filter-label { color: #bdc3c7; font-size: 0.875rem; margin-bottom: 0.25rem; display: block; }
  .input-filter { padding: 0.5rem 0.75rem; width: 100%; border-radius: 0.375rem; background-color: #1a1a2e; color: #ecf0f1; border: 1px solid #4a4a6e; outline: none; transition: border-color 0.2s; }
  .input-filter:focus { border-color: #f1c40f; }
  .select-filter { appearance: none; background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%23bdc3c7"%3e%3cpath fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /%3e%3c/svg%3e'); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.25em 1.25em; padding-right: 2.5rem; }
  .react-datepicker-wrapper input { width: 100%; }
  .button-gold { background-color: #f1c40f; color: #1a1a2e; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; transition: background-color 0.2s; border: none; cursor: pointer; }
  .button-gold:hover:not(:disabled) { background-color: #d4ac0d; } .button-gold:disabled { opacity: 0.6; cursor: not-allowed; }
  .button-silver { background-color: #7f8c8d; color: #ecf0f1; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; transition: background-color 0.2s; border: none; cursor: pointer; }
  .button-silver:hover:not(:disabled) { background-color: #6c7a7b; } .button-silver:disabled { opacity: 0.6; cursor: not-allowed; }
  .loading-container { display: flex; justify-content: center; align-items: center; min-height: 12rem; }
  .error-text { color: #e74c3c; text-align: center; padding: 2rem; }
  .info-text { color: #95a5a6; text-align: center; font-size: 0.875rem; margin-bottom: 1rem; }
  .account-list-container { max-height: 50vh; overflow-y: auto; padding-right: 0.5rem; margin-top: 1rem; }
  .account-list-container::-webkit-scrollbar { width: 8px; } .account-list-container::-webkit-scrollbar-track { background: #2e2e4a; border-radius: 4px; } .account-list-container::-webkit-scrollbar-thumb { background: #4a4a6e; border-radius: 4px; } .account-list-container::-webkit-scrollbar-thumb:hover { background: #5a5a7e; }
  .account-item { padding: 0.75rem 1rem; border-radius: 0.5rem; display: flex; flex-direction: column; sm:flex-direction: row; justify-content: space-between; align-items: flex-start; background-color: #2e2e4a; border: 1px solid #4a4a6e; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: border-color 0.2s, box-shadow 0.2s; }
  .account-item:hover { border-color: #5f5f7f; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); }
  .account-info { flex: 1; margin-bottom: 0.75rem; sm:margin-bottom: 0; sm:margin-right: 1rem; width: 100%; word-break: break-word; }
  .account-email { font-weight: 600; color: #ecf0f1; font-size: 0.95rem; line-height: 1.3; } .text-gacha-red { color: #e74c3c; }
  .account-detail { color: #bdc3c7; font-size: 0.8rem; line-height: 1.4; margin-top: 0.1rem; }
  .account-date { font-size: 0.75rem; color: #7f8c8d; margin-top: 0.25rem; }
  .tier-badge { font-weight: 700; font-size: 0.7rem; padding: 0.125rem 0.5rem; border-radius: 9999px; border-width: 1px; white-space: nowrap; }
  .account-actions { display: flex; flex-direction: row; sm:flex-direction: column; gap: 0.35rem; width: 100%; sm:width: auto; justify-content: flex-start; sm:align-items: flex-end; margin-top: 0.5rem; sm:margin-top: 0; }
  .button-action { font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 0.3rem; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; white-space: nowrap; transition: background-color 0.2s, transform 0.1s; border: none; cursor: pointer; }
  .button-action:disabled { opacity: 0.5; cursor: not-allowed; }
  .pagination-button { background-color: #e74c3c; color: white; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; transition: background-color 0.2s; border: none; cursor: pointer; }
  .pagination-button:hover:not(:disabled) { background-color: #c0392b; }
  .pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }
  .pagination-info { font-size: 0.875rem; text-align: center; order: 1; sm:order: 0; width: 100%; sm:width: auto; margin-top: 0.5rem; sm:margin-top: 0; }
  /* Warna tombol */
  .bg-purple-500 { background-color: #9b59b6; } .hover\\:bg-purple-600:hover { background-color: #8e44ad; } .text-white { color: #fff; }
  .bg-gacha-red { background-color: #e74c3c; } .hover\\:bg-gacha-red-dark:hover { background-color: #c0392b; }
`;
// Suntikkan style (jika belum ada)
const styleId = 'paginated-account-styles-dynamic';
if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
const animProps = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration:0.2} };
const buttonAnimProps = { whileHover:{ scale: 1.05 }, whileTap:{ scale: 0.95 } };

export default PaginatedAccountSection;
