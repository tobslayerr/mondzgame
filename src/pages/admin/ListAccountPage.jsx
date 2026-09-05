import React from 'react';
import { motion } from 'framer-motion';
import AccountList from '../../components/AccountList';

const ListAccountPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AccountList />
    </motion.div>
  );
};

export default ListAccountPage;