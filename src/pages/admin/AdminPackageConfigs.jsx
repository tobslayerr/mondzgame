// src/pages/admin/AdminPackageConfigs.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPackageConfigs = () => {
  const [configs, setConfigs] = useState([]);
  const [playerConfigs, setPlayerConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(50000);
  const [currentWeights, setCurrentWeights] = useState({ Nova: 0, Pulse: 0, Flux: 0, Radiant: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [packageRes, playerRes] = await Promise.all([
        API.get('/package-configs'),
        API.get('/player-configs').catch(() => ({ data: { data: [] } }))
      ]);

      if (packageRes.data.success) {
        setConfigs(packageRes.data.data);
        const current = packageRes.data.data.find(c => c.packageAmount === selectedAmount);
        if (current) setCurrentWeights(current.weights || { Nova: 0, Pulse: 0, Flux: 0, Radiant: 0 });
      }
      if (playerRes.data.success) {
        setPlayerConfigs(playerRes.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat data konfigurasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAmountChange = (amount) => {
    setSelectedAmount(amount);
    const current = configs.find(c => c.packageAmount === amount);
    if (current) {
      setCurrentWeights(current.weights || { Nova: 0, Pulse: 0, Flux: 0, Radiant: 0 });
    }
    setMessage({ text: '', type: '' });
  };

  const handleSliderChange = (tier, value) => {
    const numValue = Math.max(0, Math.min(100, Number(value)));
    setCurrentWeights(prev => ({
      ...prev,
      [tier]: numValue
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await API.put(`/package-configs/${selectedAmount}`, { weights: currentWeights });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchData();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Gagal menyimpan pengaturan.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Kalkulasi total bobot & persentase riil secara otomatis
  const totalWeight = Object.values(currentWeights).reduce((a, b) => a + b, 0);
  
  const getRealPercentage = (weight) => {
    if (totalWeight === 0) return '0.0';
    return ((weight / totalWeight) * 100).toFixed(1);
  };

  // Helper mengambil sampel gambar nyata berdasarkan tier
  const getSampleImageForTier = (tierName) => {
    let targetKey = 'd';
    if (tierName === 'Radiant') targetKey = 'a';
    else if (tierName === 'Flux') targetKey = 'b';
    else if (tierName === 'Pulse') targetKey = 'c';
    else if (tierName === 'Nova') targetKey = 'd';

    const found = playerConfigs.find(c => c.tier === targetKey);
    if (found && found.images && found.images.length > 0) {
      return found.images[0];
    }
    return null;
  };

  // Helper styling tema kartu pratinjau
  const getTierCardTheme = (tier) => {
    switch (tier) {
      case 'Radiant': return 'border-red-500 bg-gradient-to-br from-red-950/80 to-[#1a1a2e] text-red-200 shadow-red-500/20';
      case 'Flux': return 'border-yellow-500 bg-gradient-to-br from-yellow-950/80 to-[#1a1a2e] text-yellow-200 shadow-yellow-500/20';
      case 'Pulse': return 'border-green-500 bg-gradient-to-br from-green-950/80 to-[#1a1a2e] text-green-200 shadow-green-500/20';
      case 'Nova': default: return 'border-blue-500 bg-gradient-to-br from-blue-950/80 to-[#1a1a2e] text-blue-200 shadow-blue-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-72 bg-gray-700 rounded"></div>
        <div className="flex gap-2 border-b border-gray-700 pb-3">
          {[1, 2, 3].map(n => <div key={n} className="h-10 w-32 bg-gray-700 rounded-lg"></div>)}
        </div>
        <div className="h-64 bg-secondary-dark rounded-xl border border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative font-sans">
      {saving && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl min-h-[400px]">
          <LoadingSpinner size="h-10 w-10" />
          <p className="text-white font-semibold mt-3 text-sm">Menyimpan probabilitas ke server...</p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white">Pengaturan Peluang / Probabilitas Gacha</h2>
        <p className="text-gray-400 text-sm">Atur tingkat persentase kemunculan setiap tier beserta pratinjau kartu permainannya.</p>
      </div>

      {/* Tab Pilihan Nominal Paket */}
      <div className="flex gap-2 border-b border-gray-700 pb-3 overflow-x-auto">
        {[50000, 100000, 150000].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleAmountChange(amount)}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
              selectedAmount === amount 
                ? 'bg-gacha-red text-white shadow-lg' 
                : 'bg-secondary-dark text-gray-400 hover:text-white'
            }`}
          >
            Paket Rp {amount.toLocaleString('id-ID')}
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/30 border border-green-600 text-green-300' : 'bg-red-900/30 border border-red-600 text-red-300'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-secondary-dark border border-gray-700 rounded-xl p-6 shadow-md space-y-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <div>
            <h3 className="text-lg font-bold text-yellow-400 uppercase">
              Atur Peluang Paket Rp {selectedAmount.toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-gray-400">Setiap user yang membuka kotak pada paket ini dijamin akan selalu mendapatkan <strong>3 kartu</strong> dengan rincian peluang di bawah.</p>
          </div>
        </div>

        {/* --- KOTAK HINT & CONTOH PERHITUNGAN JELAS --- */}
        <div className="p-4 bg-primary-dark border border-yellow-600/50 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <span>💡</span>
            <h4>Panduan & Contoh Cara Mengaturnya</h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Slider ini menggunakan sistem perbandingan fleksibel. Agar lebih mudah, Anda bisa mengatur slider hingga totalnya pas <strong>100</strong> (atau mendekati 100), sehingga angka di slider sama persis dengan persentase aslinya.
          </p>
          
          {/* Contoh Panduan Cepat */}
          <div className="bg-secondary-dark p-3 rounded-lg border border-gray-700 text-xs space-y-1">
            <span className="font-bold text-yellow-400 block mb-1">📝 Contoh Pengaturan Sederhana (Total Pas 100%):</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-300 font-mono">
              <div>• Nova: <strong>10</strong> (10%)</div>
              <div>• Pulse: <strong>40</strong> (40%)</div>
              <div>• Flux: <strong>30</strong> (30%)</div>
              <div>• Radiant: <strong>20</strong> (20%)</div>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-gray-300 block mb-2">📊 Persentase Nyata Berdasarkan Posisi Slider Anda Saat Ini (Total Bobot: {totalWeight}):</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(currentWeights).map((tier) => (
                <div key={tier} className="bg-secondary-dark p-2.5 rounded border border-gray-700 text-center">
                  <span className="text-[11px] text-gray-400 block uppercase font-bold">{tier}</span>
                  <span className="text-lg font-extrabold text-yellow-400 font-mono">{getRealPercentage(currentWeights[tier])}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Slider dengan Pratinjau Kartu & Gambar Nyata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.keys(currentWeights).map((tier) => {
            const sampleImg = getSampleImageForTier(tier);
            return (
              <div key={tier} className="bg-primary-dark border border-gray-700 rounded-xl p-4 flex flex-col justify-between shadow-lg space-y-4">
                
                {/* Kotak Pratinjau Visual Kartu Game */}
                <div className={`border-2 rounded-xl p-3 text-center shadow-md relative overflow-hidden flex flex-col items-center ${getTierCardTheme(tier)}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Pratinjau Kartu</span>
                  
                  {/* Container Gambar Kartu */}
                  <div className="w-20 h-20 bg-black/40 border border-current/30 rounded-lg flex items-center justify-center p-1 my-1 shadow-inner overflow-hidden">
                    {sampleImg ? (
                      <img src={sampleImg} alt={tier} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Belum ada gambar</span>
                    )}
                  </div>

                  <h4 className="text-lg font-extrabold tracking-wide mt-1">{tier}</h4>
                </div>

                {/* Kontrol Slider Persentase */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-300 uppercase">Nilai Slider {tier}</label>
                    <span className="text-base font-extrabold text-yellow-400 font-mono">{currentWeights[tier]}</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentWeights[tier]}
                    onChange={(e) => handleSliderChange(tier, e.target.value)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                  
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>0 (Min)</span>
                    <span>100 (Maks)</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded font-semibold text-sm transition shadow flex items-center gap-2"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan Probabilitas'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPackageConfigs;