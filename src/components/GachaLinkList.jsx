// frontend/src/components/GachaLinkList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { formatReadableDate, capitalizeFirstLetter } from '../utils/helpers';

const GachaLinkList = ({ refreshTrigger }) => {
  const [gachaLinks, setGachaLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGachaLinks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/admin/gacha-links');
      setGachaLinks(res.data);
    } catch (err) {
      console.error('Error fetching gacha links:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to fetch gacha links.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGachaLinks(); // Fetch initially

    // Set up polling to refresh every 5 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      fetchGachaLinks();
    }, 5000); // Poll every 5 seconds

    // Clean up the interval when the component unmounts or refreshTrigger changes
    return () => clearInterval(intervalId);
  }, [fetchGachaLinks, refreshTrigger]); // Re-fetch on refreshTrigger change, but interval handles polling

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-6 rounded-lg shadow-xl mt-8"
    >
      <h3 className="text-2xl font-bold text-center text-teal-400 mb-6">
        All Gacha Links (Auto-Refresh)
      </h3>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : gachaLinks.length === 0 ? (
        <p className="text-gray-400 text-center">No gacha links created yet.</p>
      ) : (
        <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-4">
          <AnimatePresence>
            {gachaLinks.map((link) => (
              <motion.li
                key={link._id}
                variants={itemVariants}
                className={`p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center ${
                  link.isUsed ? 'bg-gray-700 text-gray-500' : 'bg-gray-700'
                }`}
              >
                <div className="flex-1 mb-2 sm:mb-0">
                  <p className="font-semibold text-lg text-gray-200">Token: <span className="font-mono text-teal-300 break-all">{link.token}</span></p>
                  <p className="text-sm text-gray-400">
                    Status:{' '}
                    <span
                      className={`font-bold ${
                        link.invoiceId?.transactionStatus === 'settlement'
                          ? 'text-green-500'
                          : link.invoiceId?.transactionStatus === 'pending'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    >
                      {capitalizeFirstLetter(link.invoiceId?.transactionStatus || 'N/A')}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Used:{' '}
                    <span className={`font-bold ${link.isUsed ? 'text-red-500' : 'text-green-500'}`}>
                      {link.isUsed ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Type: <span className={`font-bold ${link.isJackpot ? 'text-purple-400' : 'text-orange-400'}`}>
                        {link.isJackpot ? 'Jackpot Link' : 'Ampas Link'}
                    </span>
                  </p>
                  {link.isJackpot && (
                    <p className="text-xs text-gray-500 mt-1">
                        Answer: {link.correctNumber} | {link.correctColors.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Created: {formatReadableDate(link.createdAt)}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </motion.div>
  );
};

export default GachaLinkList;