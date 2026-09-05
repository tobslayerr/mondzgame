import React from 'react';
import GachaPlay from '../components/GachaPlay';
import { motion } from 'framer-motion';

const GachaPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-poppins flex items-center justify-center py-12 px-4">
      <GachaPlay />
    </div>
  );
};

export default GachaPage;