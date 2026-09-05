// src/components/admin/AdminPaymentSettings.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPaymentSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk nomor WhatsApp Admin
  const [whatsappAdminNumber, setWhatsappAdminNumber] = useState('');
  const [savingWa, setSavingWa] = useState(false);
  const [waMessage, setWaMessage] = useState({ text: '', type: '' });

  // State untuk form edit pembayaran
  const [editingItem, setEditingItem] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Ambil data pengaturan pembayaran dan nomor WhatsApp admin
  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentRes, adminRes] = await Promise.all([
        API.get('/payment-settings'),
        API.get('/admin-settings')
      ]);

      if (paymentRes.data.success) {
        setSettings(paymentRes.data.data);
      }
      if (adminRes.data.success) {
        setWhatsappAdminNumber(adminRes.data.data.whatsappAdminNumber || '');
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan:', err);
      if (err.response?.status === 401) {
        setError('Sesi habis atau Anda tidak memiliki akses (Unauthorized). Silakan login ulang.');
      } else {
        setError('Gagal memuat data pengaturan dari server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler untuk menyimpan nomor WhatsApp Admin
  const handleUpdateWhatsApp = async (e) => {
    e.preventDefault();
    setSavingWa(true);
    setWaMessage({ text: '', type: '' });

    try {
      const response = await API.put('/admin-settings', { whatsappAdminNumber });
      if (response.data.success) {
        setWaMessage({ text: 'Nomor WhatsApp Admin berhasil diperbarui!', type: 'success' });
      }
    } catch (err) {
      console.error('Gagal memperbarui WhatsApp:', err);
      setWaMessage({ text: err.response?.data?.message || 'Gagal memperbarui nomor WhatsApp.', type: 'error' });
    } finally {
      setSavingWa(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item._id);
    setAccountName(item.accountName || '');
    setAccountNumber(item.accountNumber || '');
    setIsActive(item.isActive);
    setImageFile(null);
    setMessage({ text: '', type: '' });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setMessage({ text: '', type: '' });
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('accountName', accountName);
      formData.append('accountNumber', accountNumber);
      formData.append('isActive', isActive);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await API.put(`/payment-settings/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({ text: 'Pengaturan pembayaran berhasil diperbarui!', type: 'success' });
        setEditingItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Gagal memperbarui:', err);
      setMessage({ text: err.response?.data?.message || 'Gagal memperbarui pengaturan.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg text-red-300 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Loading Spinner Global saat proses simpan */}
      {(savingWa || saving) && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl">
          <LoadingSpinner size="h-10 w-10" />
          <p className="text-white font-medium mt-3">Menyimpan perubahan ke server...</p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white">Kelola Pengaturan Sistem & Pembayaran</h2>
        <p className="text-gray-400 text-sm">Atur nomor WhatsApp admin, nomor rekening, metode pembayaran, dan QRIS.</p>
      </div>

      {/* --- SECTION: PENGATURAN WHATSAPP ADMIN --- */}
      <div className="bg-secondary-dark border border-gray-700 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-yellow-400 mb-2">Konfigurasi WhatsApp Admin</h3>
        <p className="text-gray-400 text-sm mb-4">Nomor ini akan digunakan sebagai tujuan tautan konfirmasi WhatsApp oleh user pada halaman Gacha dan Invoice.</p>

        {waMessage.text && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${waMessage.type === 'success' ? 'bg-green-900/30 border border-green-600 text-green-300' : 'bg-red-900/30 border border-red-600 text-red-300'}`}>
            {waMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdateWhatsApp} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nomor WhatsApp (Format internasional dengan kode negara, misal: +6283117420946)</label>
            <input
              type="text"
              className="w-full max-w-md bg-primary-dark border border-gray-600 rounded p-2 text-white text-sm"
              value={whatsappAdminNumber}
              onChange={(e) => setWhatsappAdminNumber(e.target.value)}
              placeholder="+6283117420946"
              required
            />
          </div>
          <button
            type="submit"
            disabled={savingWa}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {savingWa && <LoadingSpinner size="h-4 w-4" />}
            {savingWa ? 'Menyimpan...' : 'Simpan Nomor WhatsApp'}
          </button>
        </form>
      </div>

      {/* --- SECTION: PENGATURAN METODE PEMBAYARAN --- */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Metode Pembayaran & QRIS</h3>

        {message.text && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/30 border border-green-600 text-green-300' : 'bg-red-900/30 border border-red-600 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {settings.map((item) => (
            <div key={item._id} className="bg-secondary-dark border border-gray-700 rounded-xl p-5 shadow-md">
              {editingItem === item._id ? (
                /* --- FORM EDIT --- */
                <form onSubmit={(e) => handleUpdate(e, item._id)} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <h4 className="font-bold text-lg text-yellow-400">Edit: {item.method}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {item.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Nama Pemilik Akun (Atas Nama)</label>
                      <input
                        type="text"
                        className="w-full bg-primary-dark border border-gray-600 rounded p-2 text-white text-sm"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                      />
                    </div>

                    {item.method !== 'QRIS' ? (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Nomor Rekening / Nomor Tujuan</label>
                        <input
                          type="text"
                          className="w-full bg-primary-dark border border-gray-600 rounded p-2 text-white text-sm"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Upload Gambar QRIS Baru (Cloudinary)</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                          onChange={(e) => setImageFile(e.target.files[0])}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id={`active-${item._id}`}
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded bg-primary-dark border-gray-600 text-yellow-500 focus:ring-0"
                    />
                    <label htmlFor={`active-${item._id}`} className="text-sm text-gray-300">Metode Pembayaran Aktif (Tampil di User)</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <LoadingSpinner size="h-4 w-4" />}
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              ) : (
                /* --- TAMPILAN CARD --- */
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg text-white">{item.method}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300"><span className="text-gray-400">Atas Nama:</span> {item.accountName || '-'}</p>
                    {item.method !== 'QRIS' ? (
                      <p className="text-sm font-mono text-yellow-400"><span className="text-gray-400 font-sans">No. Rekening:</span> {item.accountNumber || '-'}</p>
                    ) : (
                      <div className="mt-2">
                        <span className="text-xs text-gray-400 block mb-1">QRIS Image:</span>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="QRIS" className="w-24 h-24 object-contain bg-white p-1 rounded border border-gray-600" />
                        ) : (
                          <p className="text-xs text-red-400">Belum ada gambar QRIS</p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleEditClick(item)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded font-medium transition self-end sm:self-center"
                  >
                    Edit Pengaturan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;