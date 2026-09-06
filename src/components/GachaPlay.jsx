// src/components/GachaPlay.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import API from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import InfoModal from './modals/InfoModal';

// =====================================================================
// 1. KOMPONEN UI & NEO-BRUTALISM GACHA
// =====================================================================
const FullScreenImageViewer = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="relative max-w-lg w-full max-h-[85vh] bg-white brutal-border p-3 flex flex-col shadow-[12px_12px_0_#000]" initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0, rotate: 10 }} transition={{ type: 'spring', damping: 15, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>
        <div className="border-4 border-black w-full overflow-hidden bg-white mb-2">
          <img src={src} alt="Full screen view" className="block w-full h-auto max-h-[75vh] object-contain mx-auto" />
        </div>
        <button onClick={onClose} className="absolute -top-4 -right-4 p-2 bg-[#FF3366] text-white border-4 border-black shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:outline-none transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

const IconQuestionMark = () => (
  <svg className="w-16 h-16 sm:w-24 sm:h-24 text-black drop-shadow-[3px_3px_0_#fff]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const MysteryBox = ({ onClick, colorHex }) => {
  return (
    <motion.button 
      onClick={onClick} 
      style={{ backgroundColor: colorHex }}
      className="relative w-full sm:w-[22%] h-36 sm:h-48 flex items-center justify-center cursor-pointer brutal-border brutal-shadow hover-brutal" 
      whileTap={{ scale: 0.9, y: 5, x: 5, boxShadow: "0px 0px 0px 0px #000" }} 
    >
      <motion.div 
        whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.2 }}
        transition={{ duration: 0.5 }}
      >
        <IconQuestionMark />
      </motion.div>
    </motion.button>
  );
};

const PrizeCard = ({ prize, isWinner, isHidden, layoutClass = "", onImageClick = () => {}, delayIndex = 0 }) => {
  const { tier, email, password, players } = prize;
  
  const getTierColor = () => {
    switch (tier) {
      case 'Radiant': return '#FF3366'; // Merah Neon
      case 'Flux': return '#FFDE00';    // Kuning Terang
      case 'Pulse': return '#39FF14';   // Hijau Stabilo
      case 'Nova': default: return '#00E5FF'; // Biru Cyan
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 100 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100, delay: delayIndex * 0.15 } }
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className={`bg-white brutal-border flex flex-col ${layoutClass} ${isWinner ? 'shadow-[12px_12px_0_#000] z-10' : 'brutal-shadow'}`}>
      
      {/* Header Kartu */}
      <div style={{ backgroundColor: getTierColor() }} className={`brutal-border-bottom relative flex flex-col items-center justify-center ${isWinner ? 'p-6 sm:p-10' : 'p-4 sm:p-6'}`}>
        <div className="absolute top-2 left-2 bg-black text-white text-[10px] sm:text-xs font-black px-2 py-1 uppercase tracking-widest border-2 border-white">
          TIER
        </div>

        <h3 className={`font-black uppercase mt-6 mb-1 text-black bg-white px-3 py-1 brutal-border ${isWinner ? 'text-sm sm:text-lg' : 'text-xs sm:text-sm'}`}>
          {isWinner ? 'KAMU DAPAT' : 'DI KOTAK LAIN'}
        </h3>
        <h2 className={`font-black uppercase tracking-tighter text-black drop-shadow-[4px_4px_0_#fff] ${isWinner ? 'text-6xl sm:text-8xl' : 'text-4xl sm:text-5xl'}`}>
          {tier}
        </h2>
        
        {!isWinner && players && players.length > 0 && (
          <div className="mt-6 w-full bg-white brutal-border p-4">
             <p className="text-xs sm:text-sm font-black text-black uppercase tracking-wider mb-3 text-center">ISI PEMAIN:</p>
            <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
              {players.map((playerPath, index) => (
                <button 
                  key={index}
                  type="button" 
                  onClick={() => playerPath && !playerPath.includes('placeholder') && onImageClick(playerPath)} 
                  className={`relative w-14 h-14 sm:w-20 sm:h-20 bg-white brutal-border p-1 transition-transform ${playerPath && !playerPath.includes('placeholder') ? 'cursor-pointer hover-brutal hover:scale-110' : 'opacity-50 grayscale'}`} 
                  disabled={!playerPath || playerPath.includes('placeholder')}
                >
                  <img src={playerPath || '/players/placeholder.webp'} alt={`Pemain ${index + 1}`} className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Akun (Khusus Pemenang) */}
      {isWinner && !isHidden && (
        <div className="bg-[#F4F4F0] p-6 sm:p-8 relative text-left flex-grow flex flex-col justify-center border-t-4 border-black pattern-dots">
          <div className="bg-white brutal-border p-4 mb-5 shadow-[6px_6px_0_#000]">
            <p className="text-xs font-black text-black uppercase tracking-widest mb-2 bg-[#FF90E8] inline-block px-2 py-1 border-2 border-black">EMAIL AKSES</p>
            <p className="font-mono font-bold text-black text-sm sm:text-lg break-all select-all mt-1">{email}</p>
          </div>
          <div className="bg-white brutal-border p-4 shadow-[6px_6px_0_#000]">
            <p className="text-xs font-black text-black uppercase tracking-widest mb-2 bg-[#00E5FF] inline-block px-2 py-1 border-2 border-black">PASSWORD</p>
            <p className="font-mono font-bold text-black text-sm sm:text-lg break-all select-all mt-1">{password}</p>
          </div>
        </div>
      )}

      {/* Peringatan Kemananan (Jika Akun Sudah di Refresh/Claimed) */}
      {isWinner && isHidden && (
        <div className="bg-[#FF3366] p-6 sm:p-10 relative text-center flex-grow flex flex-col justify-center items-center border-t-4 border-black pattern-dots">
          <svg className="w-14 h-14 text-white mb-4 drop-shadow-[3px_3px_0_#000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h4 className="text-white font-black text-2xl sm:text-3xl tracking-widest uppercase mb-3 drop-shadow-[3px_3px_0_#000]">INFO HILANG</h4>
          <div className="bg-black p-4 brutal-border transform rotate-1 shadow-[6px_6px_0_#FFF]">
            <p className="text-[#39FF14] font-black text-sm sm:text-base uppercase leading-relaxed">
              Info akun dan password sudah dihilangkan demi keamanan karena tautan ini sudah direfresh atau pernah dibuka.
            </p>
          </div>
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
  
  // State untuk melacak apakah Gacha sudah pernah dibuka (untuk hide password)
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
          setError("TAUTAN GACHA INI SUDAH PERNAH DIMAINKAN!");
          setPrize(gachaRes.data.account);
          setGivenAccountId(gachaRes.data.accountId);
          setDummies(gachaRes.data.dummyPrizes || []);
          setIsAlreadyClaimed(true); // Flag agar kredensial di hide
          setStep('done');
        }
      } catch (err) {
        setError("GAGAL MEMUAT DATA. TAUTAN TIDAK VALID.");
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
      setIsAlreadyClaimed(false); // Baru klaim, munculkan password
      
      setTimeout(() => {
        confetti({ particleCount: 400, spread: 200, origin: { y: 0.3 }, colors: ['#FF3366', '#00E5FF', '#FFDE00', '#39FF14', '#FF90E8', '#000000'] });
        setStep('done');
      }, 2500);

    } catch (err) {
      const msg = err.response?.data?.msg || 'TERJADI KESALAHAN SAAT KLAIM.';
      setError(msg);
      showInfoModal('ERROR', msg, 'error');
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

  const renderContent = () => {
    if (step === 'loading') return (
      <div className="flex flex-col justify-center items-center min-h-[16rem] gap-4 w-full">
        <div className="w-20 h-20 bg-[#00E5FF] brutal-border animate-spin"></div>
        <p className="font-black text-3xl tracking-widest text-black mt-4">LOADING...</p>
      </div>
    );
    if (step === 'error') return (
      <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="w-full bg-[#FF3366] brutal-border brutal-shadow p-8 text-center mx-4">
        <p className="text-white font-black text-xl sm:text-3xl uppercase">{error}</p>
      </motion.div>
    );
    
    if (step === 'ready') {
      const boxColors = ['#FF90E8', '#00E5FF', '#39FF14', '#FFDE00'];
      return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full space-y-12 py-6">
          <div className="text-center space-y-4 px-4 w-full">
            <h3 className="text-4xl sm:text-6xl font-black text-black uppercase drop-shadow-[5px_5px_0_#FFF]">PILIH KOTAKMU!</h3>
            <p className="text-base sm:text-xl font-black text-white bg-black inline-block px-6 py-2 brutal-border transform -rotate-1 shadow-[4px_4px_0_#39FF14]">Satu kotak untuk mengubah nasibmu</p>
          </div>
          {/* Kontainer box dibuat lebih besar */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-8 justify-center items-center w-full px-4">
            {[0, 1, 2, 3].map(index => (
              <MysteryBox key={index} colorHex={boxColors[index]} onClick={() => handleClaimGacha(index)} />
            ))}
          </div>
        </motion.div>
      );
    }

    if (step === 'revealing') {
      return (
        <motion.div className="flex flex-col items-center justify-center py-24 space-y-16 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center">
            <motion.div 
              className="absolute inset-0 bg-[#FFDE00] brutal-border shadow-[8px_8px_0_#000]"
              animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-6 bg-[#FF3366] brutal-border"
              animate={{ rotate: [360, 270, 180, 90, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="z-10 bg-white brutal-border p-3">
               <IconQuestionMark />
            </div>
          </div>
          <motion.h3 
            className="text-3xl sm:text-5xl font-black text-black tracking-[0.3em] bg-[#39FF14] px-6 py-3 brutal-border shadow-[6px_6px_0_#000]"
            animate={{ skewX: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            MEMBUKA...
          </motion.h3>
        </motion.div>
      );
    }

    if (step === 'done') {
      const winnerCard = prize ? { ...prize, isWinner: true } : null;
      const validDummies = Array.isArray(dummies) ? dummies : [];
      const dummyCards = validDummies.map(d => ({ ...d, isWinner: false }));
      
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-20 w-full py-6 px-2 sm:px-4">
          <div className="text-center relative w-full flex justify-center">
            <div className="absolute inset-y-0 w-full max-w-4xl bg-[#FF90E8] transform -skew-y-2 -z-10 brutal-border mx-auto"></div>
            <h3 className="text-4xl sm:text-7xl font-black text-black py-6 uppercase drop-shadow-[4px_4px_0_#FFF]">HADIAH UTAMA</h3>
          </div>
          
          <AnimatePresence>
            {winnerCard && (
              <div className="flex justify-center w-full px-2">
                {/* Melewatkan flag isHidden agar sistem keamanan berfungsi */}
                <PrizeCard prize={winnerCard} isWinner={true} isHidden={isAlreadyClaimed} layoutClass="w-full max-w-lg sm:max-w-2xl" delayIndex={0} />
              </div>
            )}
          </AnimatePresence>
          
          {dummyCards.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-24 pt-12 text-center w-full border-t-8 border-black border-dashed">
              
              <div className="bg-black text-white p-6 mb-12 brutal-shadow transform rotate-1 border-4 border-[#00E5FF] mx-auto w-full max-w-4xl">
                <h4 className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-[#00E5FF]">KOTAK YANG TERLEWAT</h4>
                <p className="text-sm sm:text-base font-bold mt-3 text-[#F4F4F0]">
                  INFO: Kartu di bawah adalah isi dari kotak yang <span className="text-[#FF3366] bg-white px-2 py-0.5 text-black brutal-border">TIDAK</span> kamu pilih.
                </p>
              </div>
              
              {/* Grid untuk kotak yang terlewat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center w-full max-w-7xl mx-auto">
                {dummyCards.map((p, index) => (
                  <PrizeCard key={`dummy-${index}`} prize={p} isWinner={false} isHidden={false} layoutClass="w-full max-w-xs sm:max-w-sm" onImageClick={setFullScreenImage} delayIndex={index + 1} />
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full pb-12">
      
      {/* Animasi Marquee Brutalism Full Width */}
      <div className="w-full bg-[#39FF14] brutal-border border-b-8 mb-10 overflow-hidden py-4 brutal-shadow whitespace-nowrap flex">
        <motion.div 
          className="font-black text-2xl sm:text-3xl uppercase tracking-widest text-black shrink-0 flex gap-12"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        >
          <span>⚡ MONDZGAME GACHA SYSTEM ⚡ KLAIM HADIAHMU SEKARANG ⚡ MONDZGAME GACHA SYSTEM ⚡ KLAIM HADIAHMU SEKARANG ⚡ MONDZGAME GACHA SYSTEM ⚡ KLAIM HADIAHMU SEKARANG ⚡</span>
        </motion.div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col items-center justify-center mb-12 w-full px-4">
        <div className="bg-white brutal-border brutal-shadow p-3 mb-6 transform -rotate-2">
          <img src="/my-company-logo.png" alt="MondzGame Logo" className="h-16 sm:h-24 w-auto" />
        </div>
        
        {/* Nominal Badge */}
        <div className="bg-black text-white brutal-border px-8 py-4 transform rotate-1 shadow-[8px_8px_0_#FF3366]">
          <span className="font-black text-lg sm:text-2xl tracking-widest">NOMINAL PAKET: <span className="text-[#FFDE00]">Rp {Number(packageAmount).toLocaleString('id-ID')}</span></span>
        </div>
      </div>
      
      {/* KONTEN UTAMA - Lebar Penuh */}
      <div className="w-full bg-white brutal-border brutal-shadow-lg p-6 sm:p-12 md:p-16 mb-12 pattern-grid">
        {renderContent()}
      </div>

      {/* ACTIONS BAWAH */}
      {step === 'done' && prize && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className="w-full bg-[#00E5FF] brutal-border brutal-shadow-lg p-6 sm:p-12 mx-auto">
          
          <div className="bg-white brutal-border p-6 mb-10 transform -rotate-1 shadow-[10px_10px_0_#000] w-full max-w-5xl mx-auto">
            <h4 className="text-black font-black text-2xl sm:text-3xl uppercase tracking-wider mb-3">! TINDAKAN DIPERLUKAN !</h4>
            <p className="text-black font-bold text-base sm:text-lg uppercase">
              {isAlreadyClaimed ? 'TAUTAN INI SUDAH DIBUKA. ANDA BISA MEMINTA BANTUAN ADMIN JIKA LUPA PASSWORD.' : 'SIMPAN DETAIL AKUN SEKARANG! Info tidak akan muncul lagi setelah ditutup. Wajib pilih konfirmasi WA di bawah!'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-6xl mx-auto">
            <button onClick={() => handleWAConfirmation('ambil')} className="w-full md:flex-1 button-brutal bg-[#39FF14] text-black text-lg sm:text-xl">
              ✅ KONFIRMASI AMBIL
            </button>
            <button onClick={handleRequestVerification} className="w-full md:flex-1 button-brutal bg-[#FFDE00] text-black text-lg sm:text-xl">
              🆘 BANTUAN ADMIN
            </button>
            <button onClick={() => handleWAConfirmation('tidak_ambil')} className="w-full md:flex-1 button-brutal bg-[#FF3366] text-white text-lg sm:text-xl">
              ❌ BATALKAN
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

// =====================================================================
// CSS INJECTION (NEO-BRUTALISM RULES FULL WIDTH)
// =====================================================================
const styles = `
  body { 
    background-color: #B8C0FF;
    background-image: radial-gradient(#000 1px, transparent 1px);
    background-size: 20px 20px;
    font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif; 
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  /* Utilities Brutalism */
  .brutal-border { border: 4px solid #000; }
  .brutal-border-bottom { border-bottom: 6px solid #000; }
  
  .brutal-shadow { 
    box-shadow: 8px 8px 0px 0px #000; 
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); 
  }
  .brutal-shadow-lg { box-shadow: 16px 16px 0px 0px #000; }
  
  .hover-brutal:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px 0px #000;
  }
  .hover-brutal:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px #000;
  }

  /* Patterns */
  .pattern-grid {
    background-size: 50px 50px;
    background-image: linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px), linear-gradient(to bottom, rgba(0,0,0,0.08) 2px, transparent 2px);
  }
  .pattern-dots {
    background-image: radial-gradient(#000 3px, transparent 3px);
    background-size: 20px 20px;
  }

  /* Buttons */
  .button-brutal { 
    font-weight: 900; 
    padding: 1.5rem 1rem; 
    border: 4px solid #000;
    box-shadow: 8px 8px 0px 0px #000;
    cursor: pointer; 
    transition: all 0.15s ease; 
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .button-brutal:hover { 
    transform: translate(-6px, -6px); 
    box-shadow: 14px 14px 0px 0px #000;
  }
  .button-brutal:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px 0px #000;
  }
`;

const styleId = 'gachaplay-brutalism-styles';
if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

export default GachaPlay;