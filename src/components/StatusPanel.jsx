import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';
import { format } from 'date-fns';

const { FiActivity, FiAlertCircle, FiInfo, FiCheckCircle, FiX } = FiIcons;

function StatusPanel() {
  const { state, actions } = useBACnet();

  const getLogIcon = (level) => {
    switch (level) {
      case 'success': return FiCheckCircle;
      case 'warning': return FiAlertCircle;
      case 'error': return FiX;
      default: return FiInfo;
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const clearLogs = () => {
    actions.clearLogs();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-bacnet-warning rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiActivity} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-bacnet-gray-900">
            Activity Log
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-bacnet-gray-600">
            {state.logs.length} entries
          </span>
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-sm text-bacnet-gray-600 hover:bg-bacnet-gray-100 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {state.logs.length === 0 ? (
          <div className="text-center py-8 text-bacnet-gray-500">
            <SafeIcon icon={FiActivity} className="text-2xl mx-auto mb-2" />
            <p>No activity logs yet</p>
          </div>
        ) : (
          state.logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start space-x-3 p-3 bg-bacnet-gray-50 rounded-lg"
            >
              <SafeIcon 
                icon={getLogIcon(log.level)} 
                className={`text-sm mt-0.5 ${getLogColor(log.level)}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-bacnet-gray-900">{log.message}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-bacnet-gray-500">
                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                  </span>
                  <span className="text-xs text-bacnet-gray-400">•</span>
                  <span className="text-xs text-bacnet-gray-500 capitalize">
                    {log.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default StatusPanel;