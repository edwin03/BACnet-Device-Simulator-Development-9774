import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';
import { format } from 'date-fns';

const { FiToggleLeft, FiToggleRight, FiEdit3, FiTrash2, FiAlertTriangle } = FiIcons;

function BinaryInputCard({ input }) {
  const { actions } = useBACnet();

  const handleToggle = () => {
    const newValue = input.presentValue === 'active' ? 'inactive' : 'active';
    actions.updateBinaryInput(input.id, { presentValue: newValue });
    actions.addLog({
      level: 'info',
      message: `Binary Input ${input.name} changed to ${newValue}`,
      category: 'points'
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${input.name}?`)) {
      actions.deleteBinaryInput(input.id);
      actions.addLog({
        level: 'warning',
        message: `Binary Input ${input.name} deleted`,
        category: 'points'
      });
    }
  };

  const toggleOutOfService = () => {
    actions.updateBinaryInput(input.id, { outOfService: !input.outOfService });
    actions.addLog({
      level: 'info',
      message: `Binary Input ${input.name} ${input.outOfService ? 'restored to service' : 'taken out of service'}`,
      category: 'points'
    });
  };

  const isActive = input.presentValue === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`bg-bacnet-gray-50 rounded-lg p-4 border-l-4 ${
        input.outOfService ? 'border-red-500' : 
        isActive ? 'border-green-500' : 'border-gray-400'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            input.outOfService ? 'bg-red-100' : 
            isActive ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {input.outOfService ? (
              <SafeIcon icon={FiAlertTriangle} className="text-red-600 text-sm" />
            ) : (
              <SafeIcon 
                icon={isActive ? FiToggleRight : FiToggleLeft} 
                className={`text-sm ${isActive ? 'text-green-600' : 'text-gray-600'}`}
              />
            )}
          </div>
          <div>
            <h3 className="font-medium text-bacnet-gray-900">{input.name}</h3>
            <p className="text-sm text-bacnet-gray-600">
              BI{input.objectId} • {input.description || 'No description'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className={`text-lg font-bold ${
              input.outOfService ? 'text-red-600' :
              isActive ? 'text-green-600' : 'text-gray-600'
            }`}>
              {input.outOfService ? 'Out of Service' : 
               isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="text-xs text-bacnet-gray-500">
              Polarity: {input.polarity}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleToggle}
              disabled={input.outOfService}
              className={`p-2 rounded transition-colors disabled:opacity-50 ${
                isActive 
                  ? 'text-green-600 hover:bg-green-100' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SafeIcon 
                icon={isActive ? FiToggleRight : FiToggleLeft} 
                className="text-lg"
              />
            </button>
            <button
              onClick={toggleOutOfService}
              className={`p-2 rounded ${
                input.outOfService
                  ? 'text-green-600 hover:bg-green-100'
                  : 'text-yellow-600 hover:bg-yellow-100'
              }`}
            >
              <SafeIcon icon={FiAlertTriangle} className="text-sm" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-100 rounded"
            >
              <SafeIcon icon={FiTrash2} className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-bacnet-gray-500">
        <span>Last updated: {format(new Date(input.lastUpdate), 'HH:mm:ss')}</span>
        <span>Reliability: {input.reliability}</span>
      </div>
    </motion.div>
  );
}

export default BinaryInputCard;