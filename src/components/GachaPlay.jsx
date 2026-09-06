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
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="relative max-w-lg w-auto max-h-[85vh] bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700 p-2" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Full screen player view" className="block max-w-full max-h-[82vh] object-contain mx-auto rounded-lg" />
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg focus:outline-none">✕</button>
      </motion.div>
    </motion.div>
  );
};

const getPlayerTierBorderColor = (playerPath) => {
  if (!playerPath) return 'border-gray-600';
  if (playerPath.includes('/tier_a/')) return 'border-red-500 shadow-red-500/20';
  if (playerPath.includes('/tier_b/')) return 'border-green-400 shadow-green-400/20';
  if (playerPath.includes('/tier_c/')) return 'border-blue-400 shadow-blue-400/20';
  if (playerPath.includes('/tier_d/')) return 'border-purple-400 shadow-purple-400/20';
  return 'border-gray-600';
};

const IconQuestionMark = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 opacity-50 group-hover:opacity-100 group-hover:text-yellow-400 transition-all duration-300 drop-shadow-md" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const MysteryBox = ({ onClick }) => (
  <motion.button onClick={onClick} className="mystery-box group relative overflow-hidden bg-gray-800 border-2 border-gray-600 hover:border-yellow-500 rounded-xl" whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 30px rgba(234, 179, 8, 0.2)" }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
    <div className="absolute inset-0 bg-gradient-to-tr from-gray-700/30 to-gray-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <motion.div className="mystery-box-inner flex items-center justify-center w-full h-full" whileHover={{ rotateY: 15, rotateX: -10 }}>
      <IconQuestionMark />
    </motion.div>
  </motion.button>
);

const PrizeCard = ({ prize, isWinner, layoutClass = "", onImageClick = () => {}, delayIndex = 0 }) => {
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
      
      {/* Shine Effect Animation for Winner */}
      {isWinner && <div className="shine-effect"></div>}

      <div className={`prize-card-top ${isWinner ? 'pt-8 pb-5' : 'py-5'}`}>
        <h3 className={`prize-card-label ${isWinner ? 'text-lg text-yellow-400' : 'text-sm text-gray-400'}`}>{isWinner ? 'Anda Mendapatkan' : ''}</h3>
        <h2 className={`prize-card-tier ${isWinner ? 'text-5xl text-white font-black tracking-widest' : 'text-3xl font-bold text-gray-200'}`}>{tier}</h2>
        
        {!isWinner && players && players.length > 0 && (
          <div className="mt-4">
             <p className="prize-card-player-label">Isian Pemain (Di Kotak Lain):</p>
            <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
              {players.map((playerPath, index) => (
                <div key={index} className="relative group">
                  <button type="button" onClick={() => playerPath && !playerPath.includes('placeholder') && onImageClick(playerPath)} className={`player-image-wrapper border border-gray-600 ${getPlayerTierBorderColor(playerPath)} ${playerPath && !playerPath.includes('placeholder') ? 'cursor-pointer hover:border-white transition-colors' : ''}`} disabled={!playerPath || playerPath.includes('placeholder')}>
                    <img src={playerPath || '/players/placeholder.webp'} alt={`Pemain ${index + 1}`} className="player-image" loading="lazy" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isWinner && (
        <div className="prize-card-bottom bg-black/50 p-4 border-t border-white/10">
          <p className="login-label text-gray-400 text-xs uppercase tracking-wider mb-1">Email Akses</p>
          <p className="login-value text-white font-mono text-sm sm:text-base mb-3 bg-black/40 px-3 py-2 rounded border border-gray-700 select-all">{email}</p>
          <p className="login-label text-gray-400 text-xs uppercase tracking-wider mb-1">Kata Sandi</p>
          <p className="login-value text-white font-mono text-sm sm:text-base bg-black/40 px-3 py-2 rounded border border-gray-700 select-all">{password}</p>
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
  const [step, setStep] = useState('loading'); // loading, ready, revealing, done
  const [prize, setPrize] = useState(null);
  const [dummies, setDummies] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [error, setError] = useState('');
  const [givenAccountId, setGivenAccountId] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [packageAmount, setPackageAmount] = useState(50000);

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
          setStep('ready');
        } else {
          setPackageAmount(gachaRes.data.packageAmount || 50000);
          setError("Tautan gacha ini telah digunakan sebelumnya.");
          setPrize(gachaRes.data.account);
          setGivenAccountId(gachaRes.data.accountId);
          setDummies(gachaRes.data.dummyPrizes || []);
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
    setSelectedBox(boxIndex);
    setError('');
    
    // Mulai fase animasi suspense membuka kapsul
    setStep('revealing');

    try {
      const res = await API.get(`/gacha/${token}?claim=true`); 
      setPackageAmount(res.data.packageAmount || 50000);
      setPrize(res.data.account);
      setDummies(res.data.dummyPrizes);
      setGivenAccountId(res.data.accountId);
      
      // Tahan animasi suspense selama 2.5 detik untuk efek eksklusif
      setTimeout(() => {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.4 }, colors: ['#f1c40f', '#e74c3c', '#ffffff', '#3498db'] });
        setStep('done');
        showInfoModal('Klaim Berhasil', `Selamat, Anda mendapatkan Akun ${res.data.account.tier}.`, 'success');
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
    // Wording diperjelas dengan spasi dan format yang rapi
    const msg = `Halo Admin, saya telah menerima akun gacha dan membutuhkan verifikasi login:\n\nEmail: ${prize.email}\nPassword: ${prize.password}\n\nMohon bantuannya untuk verifikasi. Terima kasih.`;
    window.open(`https://wa.me/${adminWaNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    try { await API.post('/user/request-verification', { accountId: givenAccountId }); } catch (e) {}
    setTimeout(() => setIsProcessingAction(false), 1000);
  };

  const handleWAConfirmation = (action) => {
    if (!prize) return;
    setIsProcessingAction(true);
    let text = '';
    
    // Wording diperjelas dengan spasi dan format yang rapi
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
      <div className="flex justify-center mb-6">
        <div className="px-5 py-2 rounded border border-gray-600 bg-gray-800/50 text-gray-300 text-xs sm:text-sm font-semibold tracking-widest uppercase shadow-sm">
          Nominal Paket: Rp {Number(amount).toLocaleString('id-ID')}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (step === 'loading') return <div className="loading-container"><LoadingSpinner size="h-10 w-10"/></div>;
    if (step === 'error') return <motion.p className="error-text">{error}</motion.p>;
    
    if (step === 'ready') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-8 py-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Pilih Kotak Keberuntungan Anda</h3>
            <p className="text-sm text-gray-400">Pilih satu kapsul untuk mengungkap hadiah utama Anda.</p>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center items-center max-w-xl mx-auto sm:max-w-none">
            {[0, 1, 2, 3].map(index => (
              <MysteryBox key={index} onClick={() => handleClaimGacha(index)} />
            ))}
          </div>
        </motion.div>
      );
    }

    if (step === 'revealing') {
      return (
        <motion.div className="flex flex-col items-center justify-center py-16 space-y-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-t-yellow-500 border-r-transparent border-b-gray-600 border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-red-500 rounded-full animate-[spin_1.5s_linear_reverse_infinite]"></div>
            <div className="w-10 h-10 bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-300 tracking-[0.2em] uppercase animate-pulse">
            Membuka Kapsul...
          </h3>
        </motion.div>
      );
    }

    if (step === 'done') {
      const winnerCard = prize ? { ...prize, isWinner: true } : null;
      const validDummies = Array.isArray(dummies) ? dummies : [];
      const dummyCards = validDummies.map(d => ({ ...d, isWinner: false }));
      
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 sm:space-y-12 w-full py-4">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider mb-2">Hadiah Utama Anda</h3>
            <p className="text-sm text-gray-400">Selamat! Berikut adalah detail hadiah yang Anda dapatkan.</p>
          </div>
          
          <AnimatePresence>
            {winnerCard && (
              <div className="flex justify-center px-2">
                <PrizeCard prize={winnerCard} isWinner={true} layoutClass="w-full max-w-sm sm:w-[45%] lg:w-[35%] sm:max-w-md" delayIndex={0} />
              </div>
            )}
          </AnimatePresence>
          
          {dummyCards.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-12 pt-10 border-t border-gray-800 text-center">
              <h4 className="text-lg sm:text-xl font-bold text-gray-300 tracking-wide mb-4">Hadiah Alternatif Lainnya</h4>
              <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 max-w-2xl mx-auto mb-8 text-left sm:text-center">
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  <span className="text-yellow-500 font-bold uppercase tracking-wider block mb-1">Pemberitahuan Penting:</span> 
                  Gambar pemain pada kartu di bawah ini adalah representasi dari kotak lain yang <span className="text-red-400 font-semibold">TIDAK</span> Anda dapatkan. Anda hanya berhak atas hadiah utama di atas.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {dummyCards.map((p, index) => (
                  <PrizeCard key={`dummy-${index}`} prize={p} isWinner={false} layoutClass="w-full max-w-xs" onImageClick={setFullScreenImage} delayIndex={index + 1} />
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
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="main-container">
      <div className="py-6 border-b border-gray-800 mb-6">
        <h2 className="header-text uppercase tracking-widest text-white">Status Klaim Gacha</h2>
      </div>
      
      {renderPackageHeaderBadge(packageAmount)}

      {error && step !== 'done' && <motion.p className="error-text mb-4 bg-red-900/20 py-3 rounded border border-red-800/50">{error}</motion.p>}
      
      <div className="content-container">{renderContent()}</div>

      {step === 'done' && prize && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="actions-container mt-10 pt-8 border-t border-gray-800">
          <div className="mb-8 p-5 bg-gray-800/50 border border-gray-700 rounded-xl text-left sm:text-center shadow-inner">
            <h4 className="text-yellow-500 font-bold text-sm sm:text-base uppercase tracking-wider mb-2">Tindakan Diperlukan</h4>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Pastikan Anda menyimpan detail akses di atas. Informasi tersebut tidak akan ditampilkan kembali setelah halaman ini ditutup. Pilih tindakan konfirmasi Anda di bawah ini.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={() => handleWAConfirmation('ambil')} className="button-action bg-white text-black hover:bg-gray-200">
              Konfirmasi Pengambilan (WA)
            </button>
            <button onClick={handleRequestVerification} className="button-action bg-gray-700 text-white hover:bg-gray-600 border border-gray-600">
              Minta Bantuan Verifikasi (WA)
            </button>
            <button onClick={() => handleWAConfirmation('tidak_ambil')} className="button-action bg-transparent text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500">
              Batalkan Pengambilan (WA)
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {fullScreenImage && <FullScreenImageViewer src={fullScreenImage} onClose={() => setFullScreenImage(null)} />}
      </AnimatePresence>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={infoModalContent.title} message={infoModalContent.message} type={infoModalContent.type}/>
    </motion.div>
  );
};

// Styling CSS Premium
const styles = `
  body { background-color: #0b0f19; }
  .main-container { background-color: #111827; padding: 0 1.5rem 2.5rem; border-radius: 1.25rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); max-width: 95%; sm:max-width: 65rem; margin: 2rem auto; border: 1px solid #1e293b; font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; position: relative;}
  
  .header-text { font-size: 1.25rem; font-weight: 700; text-align: center; }
  .error-text { color: #f87171; text-align: center; font-size: 0.9rem; font-weight: 500; }
  .loading-container { display: flex; justify-content: center; align-items: center; min-height: 16rem; }
  .content-container { min-height: 20rem; display: flex; align-items: center; justify-content: center; width: 100%; }
  
  .button-action { font-weight: 600; padding: 0.85rem 1.5rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.025em;}
  .button-action:hover { transform: translateY(-2px); }
  
  .mystery-box { width: calc(50% - 0.5rem); sm:width: calc(25% - 0.75rem); height: 11rem; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0.75rem; }
  .mystery-box-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  
  .prize-card { border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; background-color: #0f172a; border: 1px solid #334155; position: relative;}
  .prize-card-winner { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7), 0 0 20px rgba(255,255,255,0.05); border: 1px solid #475569; z-index: 10; }
  .prize-card-dummy { opacity: 0.9; transform: scale(0.95); }
  
  .prize-card-top { text-align: center; flex-grow: 1; background: linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,1) 100%); }
  .prize-card-label { font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem; letter-spacing: 0.1em; }
  .prize-card-tier { margin-bottom: 1.25rem; text-shadow: 0 2px 15px rgba(0,0,0,0.5); }
  .prize-card-player-label { font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;}
  
  .player-image-wrapper { border-radius: 0.5rem; background-color: #020617; padding: 5px; display: flex; align-items: center; justify-content: center; width: 5.5rem; height: 5.5rem; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
  .player-image { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: 0.25rem; }
  
  /* SHINE EFFECT UNTUK KARTU PEMENANG */
  .shine-effect {
      position: absolute;
      top: 0; left: -150%; width: 50%; height: 100%;
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
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

  /* WARNA TIER YANG LEBIH ELEGAN (DEEP GRADIENTS) */
  .tier-radiant { border-top-color: #ef4444; }
  .tier-radiant .prize-card-top { background: linear-gradient(180deg, rgba(127,29,29,0.3) 0%, rgba(15,23,42,1) 100%); }
  
  .tier-flux { border-top-color: #eab308; }
  .tier-flux .prize-card-top { background: linear-gradient(180deg, rgba(133,77,14,0.3) 0%, rgba(15,23,42,1) 100%); }
  
  .tier-pulse { border-top-color: #22c55e; }
  .tier-pulse .prize-card-top { background: linear-gradient(180deg, rgba(20,83,45,0.3) 0%, rgba(15,23,42,1) 100%); }
  
  .tier-nova { border-top-color: #3b82f6; }
  .tier-nova .prize-card-top { background: linear-gradient(180deg, rgba(30,58,138,0.3) 0%, rgba(15,23,42,1) 100%); }
`;

const styleId = 'gachaplay-styles-dynamic';
if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

export default GachaPlay;