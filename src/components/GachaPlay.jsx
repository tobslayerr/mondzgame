// src/components/GachaPlay.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import API from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import InfoModal from './modals/InfoModal';

// =====================================================================
// 1. KOMPONEN UI & GACHA
// =====================================================================
const FullScreenImageViewer = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="relative max-w-xl w-auto max-h-[85vh] bg-slate-900 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden border-2 border-indigo-500/50 p-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Full screen player" className="block max-w-full max-h-[80vh] object-contain mx-auto rounded-2xl" />
        <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition-all shadow-lg focus:outline-none">✕</button>
      </motion.div>
    </motion.div>
  );
};

const getPlayerTierBorderColor = (playerPath) => {
  if (!playerPath) return 'border-slate-600';
  if (playerPath.includes('/tier_a/')) return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
  if (playerPath.includes('/tier_b/')) return 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
  if (playerPath.includes('/tier_c/')) return 'border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]';
  if (playerPath.includes('/tier_d/')) return 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
  return 'border-slate-600';
};

const MysteryBox = ({ onClick, colorGradient }) => (
  <motion.button 
    onClick={onClick} 
    className={`mystery-box group relative overflow-hidden bg-gradient-to-br ${colorGradient} rounded-3xl shadow-2xl border-2 border-white/20`}
    whileHover={{ scale: 1.06, y: -6, boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.5)" }} 
    whileTap={{ scale: 0.95 }}
  >
    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <motion.div className="mystery-box-inner flex items-center justify-center w-full h-full" whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.4 }}>
      <svg className="w-20 h-20 sm:w-24 sm:h-24 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </motion.div>
  </motion.button>
);

const PrizeCard = ({ prize, isWinner, isHidden, layoutClass = "", onImageClick = () => {}, delayIndex = 0 }) => {
  const { tier, email, password, players } = prize;
  const getCardTierStyling = () => {
    switch (tier) {
      case 'Radiant': return 'tier-radiant';
      case 'Flux': return 'tier-flux';
      case 'Pulse': return 'tier-pulse';
      case 'Nova': default: return 'tier-nova';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: 90, y: 30 },
    visible: { opacity: 1, scale: 1, rotateY: 0, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100, delay: delayIndex * 0.15 } }
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className={`prize-card relative ${getCardTierStyling()} ${layoutClass} ${isWinner ? 'prize-card-winner' : 'prize-card-dummy'}`}>
      
      {isWinner && <div className="shine-effect"></div>}

      <div className={`prize-card-top ${isWinner ? 'pt-10 pb-8 px-6 sm:px-8' : 'py-6 px-5'}`}>
        <h3 className={`prize-card-label ${isWinner ? 'text-lg sm:text-xl text-amber-300 font-black' : 'text-sm sm:text-base text-slate-200 font-bold'}`}>{isWinner ? 'Anda Mendapatkan' : ''}</h3>
        <h2 className={`prize-card-tier ${isWinner ? 'text-6xl sm:text-7xl text-white font-black tracking-wider' : 'text-4xl sm:text-5xl font-extrabold text-white'}`}>{tier}</h2>
        
        {!isWinner && players && players.length > 0 && (
          <div className="mt-5 bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/15">
             <p className="prize-card-player-label text-slate-200 text-xs sm:text-sm font-bold mb-3 uppercase tracking-wider">Isian Pemain (Di Kotak Lain):</p>
            {/* DIPERBESAR UKURAN KOTAK PEMAIN */}
            <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap">
              {players.map((playerPath, index) => (
                <div key={index} className="relative group">
                  <button type="button" onClick={() => playerPath && !playerPath.includes('placeholder') && onImageClick(playerPath)} className={`player-image-wrapper border-2 ${getPlayerTierBorderColor(playerPath)} ${playerPath && !playerPath.includes('placeholder') ? 'cursor-pointer hover:border-white hover:scale-105 transition-all' : ''}`} disabled={!playerPath || playerPath.includes('placeholder')}>
                    <img src={playerPath || '/players/placeholder.webp'} alt={`Pemain ${index + 1}`} className="player-image" loading="lazy" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isWinner && !isHidden && (
        <div className="prize-card-bottom bg-slate-950/95 p-6 sm:p-8 border-t border-white/15 backdrop-blur-md">
          <p className="login-label text-indigo-300 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-1.5">Email Akses</p>
          <p className="login-value text-white font-mono text-base sm:text-lg mb-5 bg-slate-900 px-4 py-3 rounded-2xl border border-indigo-500/40 select-all shadow-inner">{email}</p>
          
          <p className="login-label text-indigo-300 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-1.5">Kata Sandi</p>
          <p className="login-value text-white font-mono text-base sm:text-lg bg-slate-900 px-4 py-3 rounded-2xl border border-indigo-500/40 select-all shadow-inner">{password}</p>
        </div>
      )}

      {isWinner && isHidden && (
        <div className="bg-red-950/95 p-8 text-center border-t border-red-500/40 backdrop-blur-md">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-red-200 text-sm sm:text-base font-bold uppercase tracking-wide leading-relaxed">
            Info akun dan password sudah dihilangkan demi keamanan karena tautan ini sudah direfresh atau pernah dibuka.
          </p>
        </div>
      )}
    </motion.div>
  );
};

// =====================================================================
// 2. MAIN GACHA COMPONENT
// =====================================================================
const GachaPlay = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('loading'); 
  const [prize, setPrize] = useState(null);
  const [dummies, setDummies] = useState([]);
  const [error, setError] = useState('');
  const [givenAccountId, setGivenAccountId] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [packageAmount, setPackageAmount] = useState(50000);
  
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '', type: 'info' });
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [adminWaNumber, setAdminWaNumber] = useState('6283117420946');

  const showInfoModal = (title, message, type = 'info') => {
    setInfoModalContent({ title, message, type });
    setIsInfoModalOpen(true);
  };

  useEffect(() => {
    const fetchGachaData = async () => {
      setStep('loading');
      setError('');
      try {
        const [gachaRes, adminRes] = await Promise.all([
          API.get(`/gacha/${token}`),
          API.get('/admin-settings').catch(() => null)
        ]);

        if (adminRes && adminRes.data.success && adminRes.data.data.whatsappAdminNumber) {
          setAdminWaNumber(adminRes.data.data.whatsappAdminNumber.replace(/[^0-9]/g, ''));
        }

        if (gachaRes.data.status === 'not_used') {
          setPackageAmount(gachaRes.data.packageAmount || 50000);
          setIsAlreadyClaimed(false);
          setStep('ready');
        } else {
          setPackageAmount(gachaRes.data.packageAmount || 50000);
          setError("Tautan gacha ini telah digunakan sebelumnya.");
          setPrize(gachaRes.data.account);
          setGivenAccountId(gachaRes.data.accountId);
          setDummies(gachaRes.data.dummyPrizes || []);
          setIsAlreadyClaimed(true);
          setStep('done');
        }
      } catch (err) {
        setError("Sistem gagal memuat data gacha. Tautan mungkin tidak valid.");
        setStep('error');
        if (err.response?.status === 404 || err.response?.status === 400) {
          setTimeout(() => navigate('/auth'), 2000);
        }
      }
    };
    fetchGachaData();
  }, [token, navigate]);

  const handleClaimGacha = async (boxIndex) => {
    if (step !== 'ready') return;
    setError('');
    setStep('revealing');

    try {
      const res = await API.get(`/gacha/${token}?claim=true`); 
      setPackageAmount(res.data.packageAmount || 50000);
      setPrize(res.data.account);
      setDummies(res.data.dummyPrizes);
      setGivenAccountId(res.data.accountId);
      setIsAlreadyClaimed(false);
      
      setTimeout(() => {
        confetti({ particleCount: 300, spread: 140, origin: { y: 0.4 }, colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'] });
        setStep('done');
        showInfoModal('Klaim Berhasil', `Selamat, Anda mendapatkan Akun Tier ${res.data.account.tier}.`, 'success');
      }, 2500);

    } catch (err) {
      const msg = err.response?.data?.msg || 'Terjadi kesalahan saat memproses klaim.';
      setError(msg);
      showInfoModal('Gagal Memproses', msg, 'error');
      setStep('error');
    }
  };

  const handleRequestVerification = async () => {
    if (!prize) return;
    setIsProcessingAction(true);
    const msg = `Halo Admin, saya telah menerima akun gacha dan membutuhkan verifikasi login:\n\nEmail: ${prize.email}\nPassword: ${prize.password}\n\nMohon bantuannya untuk verifikasi. Terima kasih.`;
    window.open(`https://wa.me/${adminWaNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    try { await API.post('/user/request-verification', { accountId: givenAccountId }); } catch (e) {}
    setTimeout(() => setIsProcessingAction(false), 1000);
  };

  const handleWAConfirmation = (action) => {
    if (!prize) return;
    setIsProcessingAction(true);
    let text = '';
    
    if (action === 'ambil') {
      text = `Halo Admin, saya ingin KONFIRMASI PENGAMBILAN AKUN GACHA:\n\nTier: ${prize.tier}\nEmail: ${prize.email}\nPassword: ${prize.password}\n\nSaya akan mengambil akun ini. Terima kasih.`;
    } else {
      text = `Halo Admin, saya ingin KONFIRMASI PEMBATALAN AKUN GACHA:\n\nTier: ${prize.tier}\nEmail: ${prize.email}\n\nAlasan: Saya memutuskan untuk tidak mengambil akun ini. Terima kasih.`;
    }
    
    window.open(`https://wa.me/${adminWaNumber}?text=${encodeURIComponent(text)}`, '_blank');
    setTimeout(() => setIsProcessingAction(false), 1000);
  };

  const renderPackageHeaderBadge = (amount) => {
    return (
      <div className="flex justify-center mb-10 relative z-10 px-4">
        <div className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-blue-500/25 border-2 border-purple-500/50 text-purple-200 text-sm sm:text-base font-black tracking-widest uppercase shadow-[0_0_25px_rgba(168,85,247,0.2)] backdrop-blur-md">
          ⚡ Nominal Paket: Rp {Number(amount).toLocaleString('id-ID')}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (step === 'loading') return <div className="loading-container"><LoadingSpinner size="h-14 w-14 text-indigo-400"/></div>;
    if (step === 'error') return <motion.p className="error-text bg-red-950/80 border border-red-500/60 p-5 rounded-2xl text-red-300 font-semibold">{error}</motion.p>;
    
    if (step === 'ready') {
      const boxGradients = [
        'from-pink-500 via-rose-600 to-red-700 shadow-pink-500/30',
        'from-sky-400 via-blue-500 to-indigo-700 shadow-sky-500/30',
        'from-emerald-400 via-green-500 to-teal-700 shadow-emerald-500/30',
        'from-amber-400 via-orange-500 to-red-600 shadow-amber-500/30'
      ];
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-10 py-8">
          <div className="text-center space-y-3 px-4">
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-wide">Pilih Kotak Keberuntungan Anda</h3>
            <p className="text-base text-slate-300 font-medium">Pilih satu kotak magis untuk mengungkap hadiah utama Anda.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-center items-center max-w-6xl mx-auto px-4">
            {[0, 1, 2, 3].map(index => (
              <MysteryBox key={index} colorGradient={boxGradients[index]} onClick={() => handleClaimGacha(index)} />
            ))}
          </div>
        </motion.div>
      );
    }

    if (step === 'revealing') {
      return (
        <motion.div className="flex flex-col items-center justify-center py-28 space-y-10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-t-pink-500 border-r-indigo-500 border-b-cyan-400 border-l-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-4 border-t-transparent border-r-amber-400 border-b-transparent border-l-rose-500 rounded-full animate-[spin_1.5s_linear_reverse_infinite]"></div>
            <div className="w-14 h-14 bg-white rounded-full animate-pulse shadow-[0_0_35px_rgba(255,255,255,1)]"></div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 tracking-[0.2em] uppercase animate-pulse">
            Membuka Kotak Keberuntungan...
          </h3>
        </motion.div>
      );
    }

    if (step === 'done') {
      const winnerCard = prize ? { ...prize, isWinner: true } : null;
      const validDummies = Array.isArray(dummies) ? dummies : [];
      const dummyCards = validDummies.map(d => ({ ...d, isWinner: false }));
      
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 sm:space-y-20 w-full py-8 px-4">
          <div className="text-center">
            <h3 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-300 tracking-wider mb-3">Hadiah Utama Anda</h3>
            <p className="text-base text-slate-300 font-medium">Selamat! Berikut adalah detail hadiah yang berhasil Anda dapatkan.</p>
          </div>
          
          <AnimatePresence>
            {winnerCard && (
              <div className="flex justify-center px-2">
                <PrizeCard prize={winnerCard} isWinner={true} isHidden={isAlreadyClaimed} layoutClass="w-full max-w-xl sm:max-w-2xl" delayIndex={0} />
              </div>
            )}
          </AnimatePresence>
          
          {dummyCards.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-20 pt-16 border-t border-slate-800 text-center">
              <h4 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wide mb-8">Hadiah Alternatif Lainnya</h4>
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto mb-12 text-left shadow-2xl backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/20 p-3 rounded-2xl text-amber-400 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">Pemberitahuan Penting:</span> 
                    Gambar pemain pada kartu di bawah ini adalah representasi dari kotak lain yang <span className="text-rose-400 font-black">TIDAK</span> Anda dapatkan. Anda hanya berhak atas hadiah utama di atas.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 justify-items-center max-w-7xl mx-auto">
                {dummyCards.map((p, index) => (
                  <PrizeCard key={`dummy-${index}`} prize={p} isWinner={false} isHidden={false} layoutClass="w-full max-w-md" onImageClick={setFullScreenImage} delayIndex={index + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white font-['Plus_Jakarta_Sans',sans-serif] py-10 px-4 sm:px-8 flex flex-col justify-between">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[95rem] mx-auto flex-grow flex flex-col justify-center">
        
        {/* Header dengan Logo MondzGame */}
        <div className="flex flex-col items-center justify-center pt-4 pb-8 relative z-10">
          <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl mb-5">
            <img src="/my-company-logo.png" alt="MondzGame Logo" className="h-16 sm:h-20 w-auto drop-shadow-xl" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-center text-white uppercase tracking-widest drop-shadow-lg">Gacha Play</h2>
          <p className="text-indigo-300 text-xs font-black mt-1.5 tracking-[0.3em]">MONDZGAME OFFICIAL</p>
        </div>
        
        {renderPackageHeaderBadge(packageAmount)}

        {error && step !== 'done' && (
          <motion.div className="mx-auto relative z-10 max-w-lg w-full px-4 mb-6">
            <p className="error-text bg-rose-950/80 border border-rose-500/60 text-rose-200 text-base font-semibold py-4 px-6 rounded-2xl text-center shadow-2xl">{error}</p>
          </motion.div>
        )}
        
        <div className="content-container relative z-10 w-full">{renderContent()}</div>

        {step === 'done' && prize && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className="actions-container relative z-10 mt-16 pb-10 px-4 max-w-5xl mx-auto w-full">
            
            <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/40 rounded-3xl text-left shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="bg-amber-500/20 p-3 rounded-2xl text-amber-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h4 className="text-amber-300 font-black text-base sm:text-lg uppercase tracking-wider">Tindakan Diperlukan</h4>
              </div>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                {isAlreadyClaimed ? 'Tautan ini sudah pernah dibuka. Silakan hubungi admin jika Anda membutuhkan bantuan lebih lanjut.' : 'Pastikan Anda menyimpan detail akses akun di atas. Informasi tersebut tidak akan ditampilkan kembali setelah halaman ini ditutup.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full">
              <button onClick={() => handleWAConfirmation('ambil')} className="w-full sm:flex-1 button-action bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/40">
                Konfirmasi Ambil (WA)
              </button>
              <button onClick={handleRequestVerification} className="w-full sm:flex-1 button-action bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border border-slate-600 shadow-slate-700/40">
                Bantuan Admin (WA)
              </button>
              <button onClick={() => handleWAConfirmation('tidak_ambil')} className="w-full sm:flex-1 button-action bg-gradient-to-r from-rose-900/70 to-rose-950/90 hover:from-rose-800 hover:to-rose-900 text-rose-200 border border-rose-500/50 shadow-rose-950/40">
                Batalkan (WA)
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {fullScreenImage && <FullScreenImageViewer src={fullScreenImage} onClose={() => setFullScreenImage(null)} />}
      </AnimatePresence>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={infoModalContent.title} message={infoModalContent.message} type={infoModalContent.type}/>
    </div>
  );
};

// Styling CSS Premium Colourful & Full Size
const styles = `
  body { 
    background-color: #030712; 
    margin: 0;
    padding: 0;
  }
  
  .loading-container { display: flex; justify-content: center; align-items: center; min-height: 22rem; }
  .content-container { min-height: 26rem; display: flex; align-items: center; justify-content: center; width: 100%; }
  
  .button-action { 
    font-weight: 800; 
    padding: 1.1rem 1.5rem; 
    border-radius: 1rem; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 1rem; 
    cursor: pointer; 
    transition: all 0.2s ease; 
    box-shadow: 0 15px 30px -5px var(--tw-shadow-color);
  }
  .button-action:hover { 
    transform: translateY(-3px); 
  }
  .button-action:active {
    transform: translateY(1px);
  }
  
  .mystery-box { 
    width: 100%; 
    height: 14rem; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    padding: 1.5rem; 
  }
  .mystery-box-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  
  .prize-card { 
    border-radius: 2rem; 
    overflow: hidden; 
    display: flex; 
    flex-direction: column; 
    background-color: #090d16; 
    border: 1px solid rgba(255, 255, 255, 0.12); 
    position: relative;
  }
  .prize-card-winner { 
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.9), 0 0 40px rgba(99, 102, 241, 0.2); 
    border: 1px solid rgba(99, 102, 241, 0.5); 
    z-index: 10; 
  }
  .prize-card-dummy { opacity: 0.95; }
  
  .prize-card-top { text-align: center; flex-grow: 1; }
  .prize-card-label { text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.1em; }
  .prize-card-tier { margin-bottom: 1rem; text-shadow: 0 4px 25px rgba(0,0,0,0.6); }
  .prize-card-player-label { text-transform: uppercase; letter-spacing: 0.05em;}
  
  /* UKURAN GAMBAR PEMAIN DIPERBESAR SIGNIFIKAN */
  .player-image-wrapper { 
    border-radius: 1rem; 
    background-color: #030712; 
    padding: 8px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    width: 6.5rem; 
    height: 6.5rem; 
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.7); 
  }
  @media (min-width: 640px) {
    .player-image-wrapper {
      width: 7.5rem;
      height: 7.5rem;
    }
  }

  .player-image { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: 0.75rem; }
  
  .shine-effect {
      position: absolute;
      top: 0; left: -150%; width: 50%; height: 100%;
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%);
      transform: skewX(-25deg);
      animation: shine 4s infinite;
      pointer-events: none;
      z-index: 20;
  }
  @keyframes shine {
      0% { left: -150%; }
      20% { left: 200%; }
      100% { left: 200%; }
  }

  /* WARNA TIER VIBRANT & COLOURFUL */
  .tier-radiant { border-top: 4px solid #ef4444; }
  .tier-radiant .prize-card-top { background: linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%); }
  
  .tier-flux { border-top: 4px solid #f59e0b; }
  .tier-flux .prize-card-top { background: linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%); }
  
  .tier-pulse { border-top: 4px solid #10b981; }
  .tier-pulse .prize-card-top { background: linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%); }
  
  .tier-nova { border-top: 4px solid #3b82f6; }
  .tier-nova .prize-card-top { background: linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%); }
`;

const styleId = 'gachaplay-styles-dynamic';
if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

export default GachaPlay;