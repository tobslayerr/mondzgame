import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPlayerConfigs = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('a');
  const [currentImages, setCurrentImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isDragging, setIsDragging] = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/player-configs');
      if (res.data.success) {
        setConfigs(res.data.data);
        const current = res.data.data.find(c => c.tier === selectedTier);
        if (current) setCurrentImages(current.images || []);
      }
    } catch (err) {
      console.error('Gagal memuat konfigurasi pemain:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleTierChange = (tier) => {
    setSelectedTier(tier);
    const current = configs.find(c => c.tier === tier);
    setCurrentImages(current ? current.images || [] : []);
    setMessage({ text: '', type: '' });
  };

  // Proses upload file (baik dari drag & drop maupun file browser)
  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage({ text: '', type: '' });

    try {
      const newImages = [...currentImages];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        const res = await API.post('/player-configs/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.success && res.data.url) {
          newImages.push(res.data.url);
        }
      }
      setCurrentImages(newImages);
      setMessage({ text: 'Gambar berhasil ditambahkan! Jangan lupa klik "Simpan Perubahan".', type: 'success' });
    } catch (err) {
      console.error('Gagal mengunggah gambar:', err);
      setMessage({ text: 'Gagal mengunggah beberapa gambar.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Event Handlers untuk Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleFilesUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFilesUpload(files);
  };

  // Hapus gambar dari list lokal
  const handleDeleteImage = (indexToRemove) => {
    const updated = currentImages.filter((_, index) => index !== indexToRemove);
    setCurrentImages(updated);
  };

  // Simpan perubahan ke database
  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await API.put(`/player-configs/${selectedTier}`, { images: currentImages });
      if (res.data.success) {
        setMessage({ text: `Tier ${selectedTier.toUpperCase()} berhasil disimpan secara permanen!`, type: 'success' });
        fetchConfigs();
      }
    } catch (err) {
      setMessage({ text: 'Gagal menyimpan perubahan ke server.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-gray-700 rounded"></div>
            <div className="h-4 w-96 bg-gray-800 rounded"></div>
          </div>
          <div className="h-10 w-36 bg-gray-700 rounded-xl"></div>
        </div>

        {/* Tab Skeleton */}
        <div className="flex gap-2 border-b border-gray-700 pb-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-10 w-24 bg-gray-700 rounded-lg"></div>
          ))}
        </div>

        {/* Drag Drop Box Skeleton */}
        <div className="h-44 bg-gray-800/60 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center"></div>

        {/* Grid Card Skeleton */}
        <div className="bg-secondary-dark border border-gray-700 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <div className="h-6 w-48 bg-gray-700 rounded"></div>
            <div className="h-9 w-32 bg-gray-700 rounded"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="bg-primary-dark border border-gray-700 rounded-lg p-2 h-44 flex flex-col justify-between">
                <div className="w-full h-32 bg-gray-800 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-800 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Global Loading Overlay saat Menyimpan atau Mengunggah */}
      {(saving || uploading) && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl min-h-[400px]">
          <LoadingSpinner size="h-12 w-12" />
          <p className="text-white font-semibold mt-4 text-base">
            {saving ? 'Menyimpan konfigurasi tier...' : 'Mengunggah gambar ke cloud...'}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Kelola Gambar Pemain (Tier A, B, C, D)</h2>
          <p className="text-gray-400 text-sm">Upload, preview, dan kelola kartu pemain untuk setiap tier.</p>
        </div>
        
        {/* Total Jumlah Badge */}
        <div className="bg-primary-dark border border-gray-700 px-4 py-2 rounded-xl text-sm font-semibold text-yellow-400">
          Total Tier {selectedTier.toUpperCase()}: <span className="text-white font-bold">{currentImages.length}</span> Gambar
        </div>
      </div>

      {/* Tab Pilihan Tier */}
      <div className="flex gap-2 border-b border-gray-700 pb-3 overflow-x-auto">
        {['a', 'b', 'c', 'd'].map((tier) => {
          const tierData = configs.find(c => c.tier === tier);
          const count = tierData ? tierData.images.length : 0;
          return (
            <button
              key={tier}
              onClick={() => handleTierChange(tier)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm uppercase transition flex items-center gap-2 ${
                selectedTier === tier 
                  ? 'bg-gacha-red text-white shadow-lg' 
                  : 'bg-secondary-dark text-gray-400 hover:text-white'
              }`}
            >
              Tier {tier}
              <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/30 border border-green-600 text-green-300' : 'bg-red-900/30 border border-red-600 text-red-300'}`}>
          {message.text}
        </div>
      )}

      {/* --- DRAG & DROP UPLOAD ZONE --- */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
          isDragging ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600 bg-secondary-dark hover:border-gray-400'
        }`}
        onClick={() => document.getElementById('hidden-file-input').click()}
      >
        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-white font-medium">
          {uploading ? 'Mengunggah gambar...' : 'Seret & Letakkan (Drag & Drop) gambar ke sini'}
        </p>
        <p className="text-gray-400 text-xs mt-1">atau klik untuk memilih file dari komputer / galeri</p>
        <input
          id="hidden-file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* --- LIST / GRID PREVIEW GAMBAR --- */}
      <div className="bg-secondary-dark border border-gray-700 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-lg font-bold text-yellow-400 uppercase">Daftar Gambar Aktif (Tier {selectedTier})</h3>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold text-sm transition disabled:opacity-50 shadow flex items-center gap-2"
          >
            {saving && <LoadingSpinner size="h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

        {currentImages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Belum ada gambar yang diunggah untuk Tier {selectedTier.toUpperCase()}. Silakan drag & drop gambar di atas.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentImages.map((imgUrl, index) => (
              <div key={index} className="relative group bg-primary-dark border border-gray-700 rounded-lg overflow-hidden p-2 flex flex-col items-center shadow">
                <div className="w-full h-32 flex items-center justify-center bg-black/40 rounded mb-2 overflow-hidden">
                  <img src={imgUrl} alt={`Player ${index}`} className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-[10px] text-gray-400 truncate w-full text-center px-1 font-mono mb-2" title={imgUrl}>
                  {imgUrl}
                </span>
                
                {/* Tombol Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg opacity-80 group-hover:opacity-100 transition transform hover:scale-110"
                  title="Hapus gambar ini"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold text-sm transition disabled:opacity-50 shadow flex items-center gap-2"
          >
            {saving && <LoadingSpinner size="h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayerConfigs;