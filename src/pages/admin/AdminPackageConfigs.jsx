// src/pages/admin/AdminPackageConfigs.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPackageConfigs = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(50000);
  const [currentWeights, setCurrentWeights] = useState({ Nova: 0, Pulse: 0, Flux: 0, Radiant: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/package-configs');
      if (res.data.success) {
        setConfigs(res.data.data);
        const current = res.data.data.find(c => c.packageAmount === selectedAmount);
        if (current) setCurrentWeights(current.weights || { Nova: 0, Pulse: 0, Flux: 0, Radiant: 0 });
      }
    } catch (err) {
      console.error('Gagal memuat konfigurasi probabilitas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAmountChange = (amount) => {
    setSelectedAmount(amount);
    const current = configs.find(c => c.packageAmount === amount);
    if (current) {
      setCurrentWeights(current.weights || { Nova: 0, Pulse: 0, Flux: 0, Radiant: 0 });
    }
    setMessage({ text: '', type: '' });
  };

  const handleWeightChange = (tier, value) => {
    const numValue = Math.max(0, Number(value));
    setCurrentWeights(prev => ({
      ...prev,
      [tier]: numValue
    }));
  };

  const totalWeight = Object.values(currentWeights).reduce((a, b) => a + b, 0);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await API.put(`/package-configs/${selectedAmount}`, { weights: currentWeights });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchConfigs();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Gagal menyimpan pengaturan.', type: 'error' });
    } finally {
      setSaving(false);
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
    <div className="space-y-6 relative">
      {saving && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl min-h-[400px]">
          <LoadingSpinner size="h-10 w-10" />
          <p className="text-white font-semibold mt-3 text-sm">Menyimpan probabilitas ke server...</p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white">Pengaturan Probabilitas Drop Rate Gacha</h2>
        <p className="text-gray-400 text-sm">Atur tingkat bobot kemunculan tier (Nova, Pulse, Flux, Radiant) untuk setiap nominal paket.</p>
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
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-lg font-bold text-yellow-400 uppercase">
            Konfigurasi Bobot Paket Rp {selectedAmount.toLocaleString('id-ID')}
          </h3>
          <div className="text-sm font-semibold text-gray-300">
            Total Bobot: <span className="text-yellow-400 font-mono text-base">{totalWeight}</span> (Relatif / Rasio)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(currentWeights).map((tier) => (
            <div key={tier} className="bg-primary-dark border border-gray-700 rounded-lg p-4 space-y-2">
              <label className="block text-sm font-bold text-white uppercase tracking-wider">{tier}</label>
              <p className="text-xs text-gray-400">Nilai bobot rasio kemunculan</p>
              <input
                type="number"
                min="0"
                className="w-full bg-secondary-dark border border-gray-600 rounded p-2 text-white font-mono text-lg focus:border-yellow-400 outline-none"
                value={currentWeights[tier]}
                onChange={(e) => handleWeightChange(tier, e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded font-semibold text-sm transition shadow flex items-center gap-2"
          >
            {saving ? 'Menyimpan...' : 'Simpan Probabilitas'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPackageConfigs;