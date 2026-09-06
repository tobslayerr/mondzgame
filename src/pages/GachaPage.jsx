// src/pages/GachaPage.jsx
import React from 'react';
import GachaPlay from '../components/GachaPlay';
import { motion } from 'framer-motion';

const GachaPage = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans flex items-center justify-center py-6 sm:py-12 px-2 sm:px-4">
      <GachaPlay />
    </div>
  );
};

export default GachaPage;