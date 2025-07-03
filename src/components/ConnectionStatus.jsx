import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';

const { FiWifi, FiWifiOff, FiRefreshCw, FiAlertCircle } = FiIcons;

function ConnectionStatus() {
  const { state } = useBACnet();

  if (state.isConnected) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
      >
        <SafeIcon icon={FiWifi} className="text-xs" />
        <span>Connected</span>
      </motion.div>
    );
  }

  if (state.connectionAttempts < 3) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700"
      >
        <SafeIcon icon={FiRefreshCw} className="text-xs animate-spin" />
        <span>Connecting...</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700"
    >
      <SafeIcon icon={FiWifiOff} className="text-xs" />
      <span>Disconnected</span>
    </motion.div>
  );
}

export default ConnectionStatus;