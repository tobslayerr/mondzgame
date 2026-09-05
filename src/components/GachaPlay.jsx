// src/components/GachaPlay.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import API from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import InfoModal from './modals/InfoModal';

// --- Komponen Full Screen Image Viewer ---
const FullScreenImageViewer = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-lg w-auto max-h-[85vh] bg-secondary-dark rounded-xl shadow-2xl overflow-hidden border border-gray-700 p-2"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Full screen player view"
          className="block max-w-full max-h-[82vh] object-contain mx-auto rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none shadow-lg"
          aria-label="Close image viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

// Helper warna tier pemain
const getPlayerTierBorderColor = (playerPath) => {
  if (!playerPath) return 'border-gray-600';
  if (playerPath.includes('/tier_a/')) return 'border-red-500 shadow-red-500/20';
  if (playerPath.includes('/tier_b/')) return 'border-green-400 shadow-green-400/20';
  if (playerPath.includes('/tier_c/')) return 'border-blue-400 shadow-blue-400/20';
  if (playerPath.includes('/tier_d/')) return 'border-purple-400 shadow-purple-400/20';
  return 'border-gray-600';
};

const IconQuestionMark = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gacha-red opacity-60 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const MysteryBox = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="mystery-box group"
    whileHover={{ scale: 1.05, boxShadow: "0px 8px 25px rgba(231, 76, 60, 0.5)" }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <motion.div
      className="mystery-box-inner"
      whileHover={{ rotateY: 10, rotateX: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <IconQuestionMark />
    </motion.div>
  </motion.button>
);

const PrizeCard = ({ prize, isWinner, layoutClass = "", onImageClick = () => {} }) => {
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
    hidden: { opacity: 0, scale: 0.8, rotateY: 180 },
    visible: { opacity: 1, scale: 1, rotateY: 0, transition: { duration: 0.6, ease: [0.17, 0.67, 0.83, 0.67] } }
  };

  return (
    <motion.div
      variants={cardVariants} initial="hidden" animate="visible" layout
      className={`prize-card ${getCardTierStyling()} ${layoutClass} ${isWinner ? 'prize-card-winner' : 'prize-card-dummy'}`}
    >
      <div className={`prize-card-top ${isWinner ? 'pt-6 pb-4' : 'py-4'}`}>
        <h3 className={`prize-card-label ${isWinner ? 'text-lg' : 'text-base'}`}>{isWinner ? 'Anda Mendapatkan' : ''}</h3>
        <h2 className={`prize-card-tier ${isWinner ? 'text-5xl text-white' : 'text-3xl sm:text-4xl'}`}>{tier}</h2>

        {!isWinner && players && players.length > 0 && (
          <div className="mt-3">
             <p className="prize-card-player-label">Isian Pemain (Di Kotak Lain):</p>
            <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
              {players.map((playerPath, index) => (
                <div key={index} className="relative group">
                  <button
                    type="button"
                    onClick={() => playerPath && !playerPath.includes('placeholder') && onImageClick(playerPath)}
                    className={`player-image-wrapper border-2 ${getPlayerTierBorderColor(playerPath)} ${playerPath && !playerPath.includes('placeholder') ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-dark focus:ring-current' : ''}`}
                    aria-label={`Lihat gambar pemain ${index + 1}`}
                    disabled={!playerPath || playerPath.includes('placeholder')}
                  >
                    <img
                      src={playerPath || '/players/placeholder.webp'}
                      alt={`Pemain ${index + 1} ${tier}`}
                      className="player-image"
                      loading="lazy"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isWinner && (
        <div className="prize-card-bottom">
          <p className="login-label">Email:</p>
          <p className="login-value">{email}</p>
          <p className="login-label mt-2">Password:</p>
          <p className="login-value">{password}</p>
        </div>
      )}
    </motion.div>
  );
};


const GachaPlay = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('loading');
  const [prize, setPrize] = useState(null);
  const [dummies, setDummies] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [error, setError] = useState('');
  const [givenAccountId, setGivenAccountId] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [packageAmount, setPackageAmount] = useState(50000);
  
  // State animasi tendangan penalti
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);
  const [goalText, setGoalText] = useState(false);
  
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
          const cleaned = adminRes.data.data.whatsappAdminNumber.replace(/[^0-9]/g, '');
          setAdminWaNumber(cleaned);
        }

        if (gachaRes.data.status === 'not_used') {
          setPackageAmount(gachaRes.data.packageAmount || 50000);
          setStep('ready');
        } else if (gachaRes.data.status === 'used' || gachaRes.data.status === 'used_account_deleted') {
          setPackageAmount(gachaRes.data.packageAmount || 50000);
          setError("Link gacha ini sudah digunakan.");
          setPrize(gachaRes.data.account);
          setGivenAccountId(gachaRes.data.accountId);
          setDummies(gachaRes.data.dummyPrizes || []);
          setSelectedBox(0);
          setStep('done');
        }
      } catch (err) {
        console.error("Error fetching gacha info:", err);
        setError("Gagal memuat halaman gacha.");
        setStep('error');
        if (err.response?.status === 404 || err.response?.status === 400) {
            setTimeout(() => navigate('/auth'), 1500);
        }
      }
    };
    fetchGachaData();
  }, [token, navigate]);

  // Langkah 1: Pilih Kotak -> Masuk ke mini-game Penalty Kick
  const handleClaimGacha = async (boxIndex) => {
    if (step !== 'ready') return;
    setSelectedBox(boxIndex);
    setError('');
    try {
      const res = await API.get(`/gacha/${token}?claim=true`); 
      setPackageAmount(res.data.packageAmount || 50000);
      setPrize(res.data.account);
      setDummies(res.data.dummyPrizes);
      setGivenAccountId(res.data.accountId);
      
      // Masuk ke tahap mini game penalti
      setStep('penalty');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Gagal klaim.';
      setError(msg);
      showInfoModal('Gagal Klaim', msg, 'error');
      setStep('error');
    }
  };

  // Langkah 2: Eksekusi Tembakan Bola ke Arah Tertentu (Kiri, Tengah, Kanan)
  const handleShoot = (direction) => {
    if (isShooting) return;
    setIsShooting(true);

    let targetX = 0;
    let targetY = -120;

    if (direction === 'left') targetX = -90;
    if (direction === 'right') targetX = 90;

    setBallPosition({ x: targetX, y: targetY });

    setTimeout(() => {
      setGoalText(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 600);

    // Setelah animasi gol selesai, buka hasil akhir gacha
    setTimeout(() => {
      setIsShooting(false);
      setGoalText(false);
      setBallPosition({ x: 0, y: 0 });
      setStep('done');
      showInfoModal('GOL! 🎉', `Anda mendapatkan Akun ${prize.tier}!`, 'success');
    }, 2200);
  };

  const handleRequestVerification = async () => {
    if (!prize) return;
    setIsProcessingAction(true);
    const whatsappMessage = encodeURIComponent(`Halo Admin, saya ${prize.email} sudah dapat akun gacha. Mohon verifikasi:\nEmail: ${prize.email}\nPass: ${prize.password}`);
    window.open(`https://wa.me/${adminWaNumber}?text=${whatsappMessage}`, '_blank');
    try {
        await API.post('/user/request-verification', { accountId: givenAccountId });
    } catch (err) {
        console.error("Verification error:", err);
    } finally {
        setTimeout(() => setIsProcessingAction(false), 1000);
    }
  };

  const handleWAConfirmation = (action) => {
    if (!prize) return;
    setIsProcessingAction(true);
    let messageText = action === 'ambil' 
      ? `Halo Admin, saya ingin KONFIRMASI PENGAMBILAN AKUN:\n\nEmail: ${prize.email}\nPass: ${prize.password}\nTier: ${prize.tier}`
      : `Halo Admin, saya ingin KONFIRMASI TIDAK MENGAMBIL AKUN:\n\nEmail: ${prize.email}\nPass: ${prize.password}\nTier: ${prize.tier}`;
    window.open(`https://wa.me/${adminWaNumber}?text=${encodeURIComponent(messageText)}`, '_blank');
    setTimeout(() => setIsProcessingAction(false), 1000);
  };

  const renderPackageHeaderBadge = (amount) => {
    let badgeStyle = "bg-blue-500/20 border-blue-500/40 text-blue-300";
    if (amount >= 150000) badgeStyle = "bg-red-500/20 border-red-500/40 text-red-300";
    else if (amount >= 100000) badgeStyle = "bg-yellow-500/20 border-yellow-500/40 text-yellow-300";

    return (
      <div className="flex justify-center mb-4">
        <div className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold tracking-wider uppercase ${badgeStyle}`}>
          Nominal Paket: Rp {Number(amount).toLocaleString('id-ID')}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (step === 'loading') return <div className="loading-container"><LoadingSpinner size="h-10 w-10"/></div>;
    if (step === 'error') return <motion.p {...animProps} className="error-text">{error || "Terjadi kesalahan."}</motion.p>;
    
    if (step === 'ready') {
      return (
        <motion.div {...animProps} className="w-full space-y-5 sm:space-y-6">
          <h3 className="title-text">Pilih Satu Kotak Keberuntungan!</h3>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center items-center max-w-xl mx-auto sm:max-w-none">
            {[0, 1, 2, 3].map(index => (
              <MysteryBox key={index} onClick={() => handleClaimGacha(index)} />
            ))}
          </div>
        </motion.div>
      );
    }

    // --- MINI GAME: TENDANGAN PENALTI ---
    if (step === 'penalty') {
      return (
        <motion.div {...animProps} className="w-full flex flex-col items-center space-y-6 py-6">
          <h3 className="title-text animate-pulse">⚽ Lakukan Tendangan Penalti Penentu!</h3>
          <p className="text-gray-300 text-sm text-center max-w-md">
            Pilih arah tembakanmu untuk menjebol gawang dan membuka hadiah utamamu!
          </p>

          {/* Area Gawang */}
          <div className="relative w-full max-w-md h-56 bg-gradient-to-b from-blue-950/40 to-green-950/40 border-4 border-dashed border-gray-600 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute top-2 w-3/4 h-28 border-2 border-white/30 border-t-0 rounded-b-lg flex items-center justify-center">
              {goalText && (
                <motion.h1 
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  className="text-5xl font-extrabold text-yellow-400 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] tracking-wider"
                >
                  GOAL! ⚽
                </motion.h1>
              )}
            </div>

            {/* Bola Sepak */}
            <motion.div
              animate={{ x: ballPosition.x, y: ballPosition.y, scale: isShooting ? 0.6 : 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute bottom-6 w-12 h-12 bg-white rounded-full border-2 border-black flex items-center justify-center shadow-2xl text-xl z-20"
            >
              ⚽
            </motion.div>
          </div>

          {/* Tombol Pilihan Arah Tendangan */}
          {!isShooting && (
            <div className="flex gap-3 justify-center w-full max-w-sm pt-2">
              <button onClick={() => handleShoot('left')} className="flex-1 py-3 bg-gacha-red hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition transform hover:-translate-y-1">
                👈 Kiri
              </button>
              <button onClick={() => handleShoot('center')} className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg shadow-lg transition transform hover:-translate-y-1">
                🎯 Tengah
              </button>
              <button onClick={() => handleShoot('right')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition transform hover:-translate-y-1">
                Kanan 👉
              </button>
            </div>
          )}
        </motion.div>
      );
    }

    if (step === 'done') {
      const winnerCard = prize ? { ...prize, isWinner: true } : null;
      const validDummies = Array.isArray(dummies) ? dummies : [];
      const dummyCards = validDummies.map(d => ({ ...d, isWinner: false }));
      return (
        <motion.div {...animProps} className="space-y-6 sm:space-y-8 w-full">
          <h3 className="title-text">✨ Hasil Gacha ✨</h3>
          <AnimatePresence>
            {winnerCard && (
              <div className="flex justify-center px-2">
                <PrizeCard prize={winnerCard} isWinner={true} layoutClass="w-full max-w-sm sm:w-[45%] lg:w-[35%] sm:max-w-md" />
              </div>
            )}
          </AnimatePresence>
          
          {dummyCards.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-700/50 text-center">
              <h4 className="subtitle-text text-gray-300">✨ Hadiah Alternatif Lain yang Anda Melewatkan ✨</h4>
              <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mb-6 bg-secondary-dark/60 p-3 rounded-lg border border-gray-700">
                📌 <strong className="text-yellow-400">Pemberitahuan Penting:</strong> Gambar pemain di bawah ini adalah <span className="text-red-400 font-semibold">hadiah alternatif/sisa dari kotak lain yang TIDAK ANDA DAPATKAN</span>.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center mt-3">
                {dummyCards.map((p, index) => (
                  <PrizeCard key={`dummy-${index}`} prize={p} isWinner={false} layoutClass="w-full max-w-xs" onImageClick={setFullScreenImage} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="main-container">
      <h2 className="header-text">Klaim Hadiah Gacha Anda!</h2>
      {renderPackageHeaderBadge(packageAmount)}

      {error && step !== 'done' && <motion.p {...animProps} className="error-text mb-4">{error}</motion.p>}
      <div className="content-container">{renderContent()}</div>

      {step === 'done' && prize && (
        <div className="actions-container">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6 p-4 bg-yellow-900/40 border border-yellow-700 rounded-lg text-center">
            <p className="text-yellow-300 font-semibold text-sm sm:text-base">⚠️ PENTING: WAJIB BACA!</p>
            <p className="text-yellow-400 text-xs sm:text-sm mt-2">
              Harap <strong>SEGERA CATAT / SCREENSHOT</strong> detail login di atas. Demi keamanan, detail akun ini <strong>TIDAK AKAN MUNCUL LAGI</strong> jika halaman di-refresh.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <motion.button onClick={() => handleWAConfirmation('ambil')} {...buttonAnimProps} className="button-action bg-blue-600 hover:bg-blue-700" disabled={isProcessingAction}>
              {isProcessingAction ? <LoadingSpinner size="h-5 w-5" /> : 'Konfirmasi Saya Ambil (WA)'}
            </motion.button>
            <motion.button onClick={handleRequestVerification} {...buttonAnimProps} className="button-action bg-green-500 hover:bg-green-600" disabled={isProcessingAction}>
              {isProcessingAction ? <LoadingSpinner size="h-5 w-5" /> : 'Minta Verifikasi (WA)'}
            </motion.button>
            <motion.button onClick={() => handleWAConfirmation('tidak_ambil')} {...buttonAnimProps} className="button-action button-danger" disabled={isProcessingAction}>
              {isProcessingAction ? <LoadingSpinner size="h-5 w-5" /> : 'Konfirmasi Tidak Ambil (WA)'}
            </motion.button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {fullScreenImage && <FullScreenImageViewer src={fullScreenImage} onClose={() => setFullScreenImage(null)} />}
      </AnimatePresence>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={infoModalContent.title} message={infoModalContent.message} type={infoModalContent.type}/>
    </motion.div>
  );
};

// --- STYLING CSS ---
const styles = `
  body { background-color: #1a1a2e; }
  .main-container { background-color: #1a1a2e; padding: 1rem 1rem 1.5rem; border-radius: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-width: 95%; sm:max-width: 65rem; margin: 1.5rem auto; border: 1px solid #3a3a5a; font-family: 'Plus Jakarta Sans', sans-serif; }
  .header-text { font-size: 1.5rem; font-weight: 700; text-align: center; color: #e74c3c; margin-bottom: 0.25rem; }
  .error-text { color: #e74c3c; text-align: center; font-size: 0.9rem; font-weight: 500; }
  .info-text { color: #95a5a6; text-align: center; font-size: 0.9rem; }
  .loading-container { display: flex; justify-content: center; align-items: center; min-height: 16rem; }
  .content-container { min-height: 16rem; display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 1rem; }
  .title-text { font-size: 1.6rem; font-weight: 700; text-align: center; color: #f1c40f; margin-bottom: 1.5rem; text-shadow: 0 2px 5px rgba(0,0,0,0.4); }
  .subtitle-text { font-size: 1.15rem; font-weight: 600; text-align: center; color: #95a5a6; margin-bottom: 1.2rem; }
  .actions-container { margin-top: 2.5rem; border-top: 1px solid #3a3a5a; padding-top: 1.75rem; }
  .button-action { color: white; font-weight: 600; padding: 0.7rem 1.4rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border: none; cursor: pointer; }
  .button-action:disabled { opacity: 0.6; cursor: not-allowed; }
  .button-danger { background-color: #c0392b; }
  .mystery-box { width: calc(50% - 0.5rem); sm:width: calc(25% - 0.75rem); height: 11rem; background-color: #2e2e4a; border-radius: 0.75rem; border: 2px solid #4a4a6e; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0.75rem; }
  .mystery-box-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  .prize-card { border-radius: 0.8rem; border-width: 2px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden; }
  .prize-card-winner { transform: scale(1.05); z-index: 10; box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
  .prize-card-top { text-align: center; padding: 1rem 1.25rem; flex-grow: 1; background-color: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1); }
  .prize-card-label { font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem; }
  .prize-card-tier { font-weight: 800; margin-bottom: 1rem; }
  .prize-card-player-label { font-size: 0.85rem; color: #bdc3c7; margin-bottom: 0.5rem; font-weight: 600; }
  .player-image-wrapper { border-radius: 0.5rem; background-color: #0d0d1a; padding: 4px; display: flex; align-items: center; justify-content: center; width: 6rem; height: 6rem; }
  .player-image { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: 0.35rem; }
  .prize-card-bottom { border-top: 1px solid rgba(127, 140, 141, 0.2); padding: 1rem; background-color: rgba(0,0,0,0.4); }
  .login-label { font-size: 0.75rem; color: #7f8c8d; font-weight: 500; }
  .login-value { font-size: 0.9rem; font-weight: 500; color: #bdc3c7; font-family: monospace; }
  .tier-radiant { border-color: rgba(231, 76, 60, 0.7); background-image: linear-gradient(135deg, rgba(192, 57, 43, 0.7) 0%, #1a1a2e 75%); color: #f5b7b1; }
  .tier-flux { border-color: rgba(241, 196, 15, 0.7); background-image: linear-gradient(135deg, rgba(212, 172, 13, 0.7) 0%, #1a1a2e 75%); color: #f7dc6f; }
  .tier-pulse { border-color: rgba(39, 174, 96, 0.7); background-image: linear-gradient(135deg, rgba(34, 153, 84, 0.7) 0%, #1a1a2e 75%); color: #a9dfbf; }
  .tier-nova { border-color: rgba(52, 152, 219, 0.7); background-image: linear-gradient(135deg, rgba(41, 128, 185, 0.7) 0%, #1a1a2e 75%); color: #aed6f1; }
`;

const styleId = 'gachaplay-styles-dynamic';
if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

const animProps = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration: 0.3} };
const buttonAnimProps = { whileHover:{ scale: 1.03, y: -2 }, whileTag:{ scale: 0.97 } };

export default GachaPlay;