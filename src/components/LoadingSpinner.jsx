// frontend/src/components/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion'; // Pastikan motion diimport

const LoadingSpinner = ({ className = 'text-teal-400', size = 'h-8 w-8' }) => {
  return (
    <motion.div
      // Properti animasi untuk kemunculan/penghilangan spinner
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: "easeOut" }} // Transisi yang lebih cepat untuk kemunculan
      
      className={`flex justify-center items-center ${className}`}
    >
      <motion.div
        className={`${size} border-4 border-b-transparent rounded-full`} // Gunakan prop size
        style={{ borderColor: 'currentColor', borderBottomColor: 'transparent' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      ></motion.div>
    </motion.div>
  );
};

export default LoadingSpinner;