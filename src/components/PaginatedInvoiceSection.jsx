import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { formatReadableDate, capitalizeFirstLetter } from '../utils/helpers';
import ConfirmationModal from './modals/ConfirmationModal';
import InfoModal from './modals/InfoModal';

// --- Icon untuk Tombol Copy ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
// --- Icon Tombol Disabled Link ---
const LinkUsedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6" strokeWidth={2.5}/>
    </svg>
);
// --- Akhir Icon ---


const PaginatedInvoiceSection = ({ title, isPaid, refreshTrigger, showActions, onActionSuccess = () => {} }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);

  // Filter state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [linkStatus, setLinkStatus] = useState('all');
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [appliedLinkStatus, setAppliedLinkStatus] = useState('all');

  const [isPrinting, setIsPrinting] = useState(false);

  // Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmActionArgs, setConfirmActionArgs] = useState({ id: null, action: null });
  const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '' });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '', type: 'info' });

  // State untuk feedback tombol Copy
  const [copiedToken, setCopiedToken] = useState(null);

  const showInfoModal = (title, message, type = 'info') => {
    setInfoModalContent({ title, message, type });
    setIsInfoModalOpen(true);
  };

  const fetchInvoices = useCallback(async (page, start, end, status) => {
    setLoading(true);
    setError('');
    const params = { page, limit: 10, isPaid, linkStatus: status };
    if (start) params.startDate = start.toISOString();
    if (end) {
      const localEnd = new Date(end);
      localEnd.setHours(23, 59, 59, 999);
      params.endDate = localEnd.toISOString();
    }
    try {
      const res = await API.get('/admin/invoices', { params });
      if (res.data && Array.isArray(res.data.invoices)) {
        setInvoices(res.data.invoices);
        setTotalPages(res.data.totalPages || 1);
        setTotalInvoices(res.data.totalItems || 0);
        setCurrentPage(res.data.currentPage || 1);
      } else {
        setInvoices([]); setError('Format data tidak terduga.');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Gagal mengambil data.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [isPaid]);

  const executeApproveInvoice = async (invoiceId) => {
    setProcessingId(invoiceId);
    try {
      const res = await API.put(`/admin/invoices/${invoiceId}/approve-generate-gacha-link`);
      showInfoModal('Sukses', `${res.data.msg}. Token: ${res.data.gachaLink.token}`, 'success');
      onActionSuccess();
    } catch (err) {
      showInfoModal('Error', err.response?.data?.msg || 'Gagal menyetujui invoice.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const triggerApproveInvoice = (invoiceId) => {
    setConfirmActionArgs({ id: invoiceId, action: 'approve' });
    setConfirmModalContent({
      title: 'Konfirmasi Setujui Invoice',
      message: 'Yakin ingin menyetujui invoice ini? Link gacha akan dibuat dan tidak bisa dibatalkan.'
    });
    setIsConfirmModalOpen(true);
  };

  const executeDeleteInvoice = async (invoiceId) => {
      setProcessingId(invoiceId);
      try {
        const res = await API.delete(`/admin/invoices/${invoiceId}`);
        showInfoModal('Sukses', res.data.msg, 'success');
        onActionSuccess();
      } catch (err) {
        console.error('Error deleting invoice:', err.response?.data || err.message);
        showInfoModal('Error', err.response?.data?.msg || 'Gagal menghapus invoice.', 'error');
      } finally {
        setProcessingId(null);
      }
  };

  const triggerDeleteInvoice = (invoiceId) => {
    setConfirmActionArgs({ id: invoiceId, action: 'delete' });
    setConfirmModalContent({ title: 'Konfirmasi Hapus Invoice', message: 'Yakin hapus invoice ini? Tidak bisa dibatalkan.' });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    const { id, action } = confirmActionArgs;
    if (action === 'approve') {
      executeApproveInvoice(id);
    } else if (action === 'delete') {
      executeDeleteInvoice(id);
    }
  };

  useEffect(() => { fetchInvoices(currentPage, appliedStartDate, appliedEndDate, appliedLinkStatus); }, [fetchInvoices, refreshTrigger, currentPage, appliedStartDate, appliedEndDate, appliedLinkStatus]);

  const handleFilterApply = () => { setAppliedStartDate(startDate); setAppliedEndDate(endDate); setAppliedLinkStatus(linkStatus); setCurrentPage(1); };
  const handleFilterReset = () => { setStartDate(null); setEndDate(null); setLinkStatus('all'); setAppliedStartDate(null); setAppliedEndDate(null); setAppliedLinkStatus('all'); setCurrentPage(1); };
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) setCurrentPage(newPage); };

  const generatePDF = (invoiceData, totalAmount, period, allTime) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Laporan Penghasilan (Invoice Lunas & Terpakai)", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const displayPeriod = period.includes('...') ? period.replace('...', 'Awal').replace('...', 'Akhir') : period;
    doc.text(`Periode: ${displayPeriod}`, 14, 29);

    const tableColumn = ["No", "ID Pesanan", "Email Pengguna", "Tgl Dibuat", "Jumlah (IDR)"];
    const tableRows = [];
    invoiceData.forEach((invoice, index) => {
      const invoiceDate = new Date(invoice.createdAt);
      const formattedDate = `${invoiceDate.getDate().toString().padStart(2, '0')}/${(invoiceDate.getMonth()+1).toString().padStart(2, '0')}/${invoiceDate.getFullYear()}`;
      const row = [ index + 1, invoice.orderId, invoice.customerEmail, formattedDate, invoice.grossAmount.toLocaleString('id-ID') ];
      tableRows.push(row);
    });
    const tableFooter = [ ["", "", "", "Total Penghasilan", totalAmount.toLocaleString('id-ID')] ];

    autoTable(doc, {
      head: [tableColumn], body: tableRows, foot: tableFooter, startY: 35,
      headStyles: { fillColor: [231, 76, 60] }, footStyles: { fillColor: [46, 46, 74], fontStyle: 'bold' },
      showFoot: 'lastPage',
    });

    const startDateString = appliedStartDate ? appliedStartDate.toISOString().split('T')[0] : 'all';
    const endDateString = appliedEndDate ? appliedEndDate.toISOString().split('T')[0] : 'all';
    const fileNamePeriod = allTime ? 'semua_waktu' : `${startDateString}_hingga_${endDateString}`;
    doc.save(`laporan_penghasilan_${fileNamePeriod}.pdf`);
  };

  const handlePrintPDF = async (allTime = false) => {
    setIsPrinting(true);
    let period = "Semua Waktu (Hanya Link Terpakai)";
    const params = {};

    if (!allTime) {
      if (appliedStartDate) { params.startDate = appliedStartDate.toISOString(); }
      if (appliedEndDate) {
          const localEnd = new Date(appliedEndDate);
          localEnd.setHours(23, 59, 59, 999);
          params.endDate = localEnd.toISOString();
      }
      const startStr = appliedStartDate ? appliedStartDate.toLocaleDateString('id-ID') : '...';
      const endStr = appliedEndDate ? appliedEndDate.toLocaleDateString('id-ID') : '...';
      period = `${startStr} - ${endStr} (Hanya Link Terpakai)`;
    }

    try {
      const res = await API.get('/admin/invoices/report', { params });
      if (res.data.invoices.length === 0) {
          showInfoModal('Info Laporan', 'Tidak ada data penghasilan (link terpakai) untuk periode yang dipilih.', 'info');
          return;
      }
      generatePDF(res.data.invoices, res.data.totalAmount, period, allTime);
    } catch (err) {
      console.error("Error fetching report data:", err);
      showInfoModal('Error Laporan', "Gagal membuat laporan PDF: " + (err.response?.data?.msg || err.message), 'error');
    } finally {
      setIsPrinting(false);
    }
   };

  const handleCopyLink = async (token) => {
    if (!token) return;
    const link = `${window.location.origin}/gacha/${token}`;
    try {
        await navigator.clipboard.writeText(link);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
        console.error('Failed to copy link: ', err);
        showInfoModal('Error', 'Gagal menyalin link.', 'error');
    }
  };

  // Helper render badge paket berdasarkan grossAmount
  const renderPackageBadge = (amount) => {
    let badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    let label = `Rp ${Number(amount).toLocaleString('id-ID')}`;
    
    if (amount >= 150000) {
      badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30';
    } else if (amount >= 100000) {
      badgeColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor} ml-2`}>
        {label}
      </span>
    );
  };

  const listVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex flex-wrap justify-between items-center gap-2 mt-6 text-text-light">
        <motion.button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="pagination-button">
          Sebelumnya
        </motion.button>
        <span className="pagination-info">
          Halaman <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
        </span>
        <motion.button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="pagination-button">
          Berikutnya
        </motion.button>
      </div>
    );
  };

  return (
    <div className="mb-8 p-4 bg-primary-dark rounded-lg shadow-inner font-sans">
      <h4 className="text-xl font-bold text-gacha-red mb-4">{title}</h4>

      {/* Bagian Tombol Cetak PDF */}
      {isPaid && (
        <div className="p-4 bg-secondary-dark rounded-lg mb-6 flex flex-wrap gap-4 items-center justify-between">
          <p className="text-text-muted text-sm w-full md:w-auto">Cetak Laporan Penghasilan (Hanya Link Terpakai):</p>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <motion.button onClick={() => handlePrintPDF(false)} disabled={isPrinting || loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="button-gold text-xs sm:text-sm flex-1 sm:flex-none"> {isPrinting ? <LoadingSpinner size="h-4 w-4" /> : 'Cetak (Filter)'} </motion.button>
            <motion.button onClick={() => handlePrintPDF(true)} disabled={isPrinting || loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="button-silver text-xs sm:text-sm flex-1 sm:flex-none"> {isPrinting ? <LoadingSpinner size="h-4 w-4" /> : 'Cetak (Semua)'} </motion.button>
          </div>
        </div>
      )}

      {/* Filter UI */}
      <div className="p-4 bg-secondary-dark rounded-lg mb-6 flex flex-wrap gap-4 items-end justify-center">
        <div className="flex flex-col flex-grow w-full sm:w-auto"> <label className="filter-label">Tanggal Mulai</label> <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} placeholderText="Pilih tgl mulai" className="input-filter"/> </div>
        <div className="flex flex-col flex-grow w-full sm:w-auto"> <label className="filter-label">Tanggal Akhir</label> <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} placeholderText="Pilih tgl akhir" className="input-filter"/> </div>
        {isPaid && ( <div className="flex flex-col w-full sm:w-auto"> <label className="filter-label">Status Link</label> <select value={linkStatus} onChange={(e) => setLinkStatus(e.target.value)} className="input-filter select-filter"> <option value="all">Keduanya</option> <option value="used">Terpakai</option> <option value="not_used">Belum Terpakai</option> </select> </div> )}
        <div className="flex gap-2 w-full sm:w-auto"> <motion.button onClick={handleFilterApply} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="button-gold flex-1 sm:flex-none">Filter</motion.button> <motion.button onClick={handleFilterReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="button-silver flex-1 sm:flex-none">Reset</motion.button> </div>
      </div>

      {/* Daftar Invoice */}
      <AnimatePresence mode="wait">
        {loading ? ( <div className="loading-container"><LoadingSpinner size="h-10 w-10"/></div> )
         : error ? ( <motion.p key="error" {...animProps} className="error-text">{error}</motion.p> )
         : (
          <motion.div key="content" {...animProps} className="min-h-[192px]">
            {totalInvoices > 0 ? ( <p className="info-text">Total {totalInvoices} invoice. Halaman {currentPage}/{totalPages}.</p> )
             : ( <p className="info-text">Tidak ada invoice ditemukan.</p> )}
            <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-4">
              <AnimatePresence>
                {invoices.map((invoice) => (
                  <motion.li key={invoice._id} variants={itemVariants} layout className={`invoice-item ${invoice.isPaid ? 'opacity-90' : ''}`}>
                    <div className="invoice-info">
                       <div className="flex items-center flex-wrap gap-1 mb-1">
                         <p className="invoice-id">ID: <span className="font-mono text-gacha-gold">{invoice.orderId}</span></p>
                         {/* Badge Paket Harga */}
                         {renderPackageBadge(invoice.grossAmount)}
                       </div>
                       <p className="invoice-detail">Email: <span className="font-mono text-text-light">{invoice.customerEmail}</span></p>
                       <p className="invoice-detail">Jumlah: IDR {invoice.grossAmount.toLocaleString()}</p>
                       <p className="invoice-detail">Status: <span className={`font-bold ${invoice.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>{invoice.isPaid ? 'Lunas' : 'Menunggu'}</span></p>

                       {invoice.gachaLink && (
                         <div className="mt-2 flex items-center gap-2 flex-wrap">
                           <span className="invoice-detail flex-shrink-0 font-medium text-text-light">Link Gacha:</span>
                           {invoice.gachaLink.isUsed ? (
                             <button className="button-link-disabled" disabled>
                               <LinkUsedIcon />
                               Link Sudah Terpakai
                             </button>
                           ) : (
                             <motion.button
                               onClick={() => handleCopyLink(invoice.gachaLink.token)}
                               className={`button-copy-link ${copiedToken === invoice.gachaLink.token ? 'copied' : ''}`}
                               whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                               aria-label="Salin Link Gacha"
                             >
                               {copiedToken === invoice.gachaLink.token ? <CheckIcon /> : <CopyIcon />}
                               {copiedToken === invoice.gachaLink.token ? 'Link Disalin!' : 'Salin Link'}
                             </motion.button>
                           )}
                         </div>
                       )}

                    </div>
                    <div className="invoice-actions">
                       <p className="invoice-date">Dibuat: {formatReadableDate(invoice.createdAt)}</p>
                       {showActions && !invoice.isPaid && (
                        <div className="flex gap-2 mt-1 sm:mt-0">
                          <motion.button onClick={() => triggerApproveInvoice(invoice._id)} {...buttonAnimProps} className="button-action bg-green-500 hover:bg-green-600 text-white" disabled={processingId === invoice._id}> {processingId === invoice._id ? <LoadingSpinner size="h-4 w-4" /> : 'Setujui'} </motion.button>
                          <motion.button onClick={() => triggerDeleteInvoice(invoice._id)} {...buttonAnimProps} className="button-action bg-gacha-red hover:bg-gacha-red-dark text-white" disabled={processingId === invoice._id}> {processingId === invoice._id ? <LoadingSpinner size="h-4 w-4" /> : 'Hapus'} </motion.button>
                        </div>
                       )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {renderPagination()}
          </motion.div>
        )}
      </AnimatePresence>

       <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmAction} title={confirmModalContent.title} message={confirmModalContent.message} />
       <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={infoModalContent.title} message={infoModalContent.message} type={infoModalContent.type} />
    </div>
  );
};

// --- STYLING TAMBAHAN ---
const styles = `
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
  .invoice-item { padding: 0.75rem 1rem; sm:padding: 1rem 1.25rem; border-radius: 0.5rem; display: flex; flex-direction: column; sm:flex-direction: row; justify-content: space-between; align-items: flex-start; background-color: #2e2e4a; border: 1px solid #4a4a6e; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: border-color 0.2s, box-shadow 0.2s; }
  .invoice-item:hover { border-color: #5f5f7f; }
  .invoice-info { flex: 1; margin-bottom: 0.75rem; sm:margin-bottom: 0; sm:margin-right: 1rem; width: 100%; word-break: break-word; space-y: 0.3rem; }
  .invoice-id { font-weight: 600; font-size: 1rem; sm:text-lg; color: #ecf0f1; line-height: 1.3; }
  .invoice-detail { color: #bdc3c7; font-size: 0.8rem; sm:font-size: 0.875rem; line-height: 1.4; display: flex; align-items: center; flex-wrap: wrap; }
  .invoice-actions { display: flex; flex-direction: column; sm:flex-direction: row; align-items: flex-start; sm:align-items: center; gap: 0.5rem; width: 100%; sm:width: auto; margin-top: 0.5rem; sm:margin-top: 0; text-align: left; sm:text-right; }
  .invoice-date { font-size: 0.75rem; color: #7f8c8d; flex-shrink: 0; sm:mr-4; }
  .button-action { font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 0.3rem; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; white-space: nowrap; transition: background-color 0.2s, transform 0.1s; border: none; cursor: pointer; }
  .button-action:disabled { opacity: 0.5; cursor: not-allowed; }
  .pagination-button { background-color: #e74c3c; color: white; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; transition: background-color 0.2s; border: none; cursor: pointer; }
  .pagination-button:hover:not(:disabled) { background-color: #c0392b; }
  .pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }
  .pagination-info { font-size: 0.875rem; text-align: center; order: 1; sm:order: 0; width: 100%; sm:width: auto; margin-top: 0.5rem; sm:margin-top: 0; }
  .bg-green-500 { background-color: #27ae60; } .hover\\:bg-green-600:hover { background-color: #229954; } .text-white { color: #fff; }
  .bg-gacha-red { background-color: #e74c3c; } .hover\\:bg-gacha-red-dark:hover { background-color: #c0392b; }
  .button-copy-link { background-color: #3498db; color: white; font-weight: 500; padding: 0.35rem 0.85rem; border-radius: 0.375rem; font-size: 0.75rem; display: inline-flex; align-items: center; transition: background-color 0.2s, transform 0.1s; border: none; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
  .button-copy-link:hover { background-color: #2980b9; transform: translateY(-1px); }
  .button-copy-link.copied { background-color: #27ae60; }
  .button-link-disabled { background-color: #5a5a7e; color: #95a5a6; font-weight: 500; padding: 0.35rem 0.85rem; border-radius: 0.375rem; font-size: 0.75rem; display: inline-flex; align-items: center; cursor: not-allowed; opacity: 0.8; border: none; }
`;

const styleId = 'paginated-invoice-styles-dynamic';
if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
const animProps = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration:0.2} };
const buttonAnimProps = { whileHover:{ scale: 1.05 }, whileTap:{ scale: 0.95 } };

export default PaginatedInvoiceSection;