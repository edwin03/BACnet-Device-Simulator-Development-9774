import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';

const { FiServer, FiAlertTriangle, FiRefreshCw, FiCheckCircle } = FiIcons;

function ServerStatus() {
  const { state } = useBACnet();

  const getStatusInfo = () => {
    if (state.isConnected) {
      return {
        icon: FiCheckCircle,
        title: 'Server Connected',
        message: 'BACnet server is running and connected',
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    }

    if (state.connectionAttempts < 3) {
      return {
        icon: FiRefreshCw,
        title: 'Connecting to Server',
        message: `Attempting to connect... (${state.connectionAttempts}/3)`,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        spinning: true
      };
    }

    return {
      icon: FiAlertTriangle,
      title: 'Server Disconnected',
      message: 'Cannot connect to BACnet server. Please make sure it\'s running.',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    };
  };

  const status = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${status.bgColor} ${status.borderColor} border rounded-lg p-4 mb-6`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${status.color}-100`}>
          <SafeIcon 
            icon={status.icon} 
            className={`text-${status.color}-600 text-sm ${status.spinning ? 'animate-spin' : ''}`} 
          />
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${status.textColor}`}>
            {status.title}
          </h3>
          <p className={`text-sm ${status.textColor} opacity-80`}>
            {status.message}
          </p>
        </div>
      </div>
      
      {!state.isConnected && state.connectionAttempts >= 3 && (
        <div className="mt-3 p-3 bg-white rounded border border-red-200">
          <h4 className="font-medium text-red-800 mb-2">Troubleshooting Steps:</h4>
          <ol className="text-sm text-red-700 space-y-1">
            <li>1. Make sure the BACnet server is running: <code className="bg-red-100 px-1 rounded">npm run server</code></li>
            <li>2. Check if ports 3001-3005 are available</li>
            <li>3. Try restarting both server and client</li>
            <li>4. Run: <code className="bg-red-100 px-1 rounded">npm run clean-start</code></li>
          </ol>
        </div>
      )}
    </motion.div>
  );
}

export default ServerStatus;