import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';
import { format } from 'date-fns';

const { FiTrendingUp, FiEdit3, FiTrash2, FiCheck, FiX, FiAlertTriangle } = FiIcons;

function AnalogInputCard({ input }) {
  const { actions } = useBACnet();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(input.presentValue);

  const handleSave = () => {
    const newValue = Math.max(
      input.minValue,
      Math.min(input.maxValue, parseFloat(editValue))
    );
    
    actions.updateAnalogInput(input.id, { presentValue: newValue });
    actions.addLog({
      level: 'info',
      message: `Analog Input ${input.name} value changed to ${newValue}`,
      category: 'points'
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(input.presentValue);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${input.name}?`)) {
      actions.deleteAnalogInput(input.id);
      actions.addLog({
        level: 'warning',
        message: `Analog Input ${input.name} deleted`,
        category: 'points'
      });
    }
  };

  const toggleOutOfService = () => {
    actions.updateAnalogInput(input.id, { outOfService: !input.outOfService });
    actions.addLog({
      level: 'info',
      message: `Analog Input ${input.name} ${input.outOfService ? 'restored to service' : 'taken out of service'}`,
      category: 'points'
    });
  };

  const getValueColor = () => {
    const percentage = ((input.presentValue - input.minValue) / (input.maxValue - input.minValue)) * 100;
    if (percentage < 25) return 'text-blue-600';
    if (percentage < 50) return 'text-green-600';
    if (percentage < 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`bg-bacnet-gray-50 rounded-lg p-4 border-l-4 ${
        input.outOfService ? 'border-red-500' : 'border-blue-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            input.outOfService ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {input.outOfService ? (
              <SafeIcon icon={FiAlertTriangle} className="text-red-600 text-sm" />
            ) : (
              <SafeIcon icon={FiTrendingUp} className="text-blue-600 text-sm" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-bacnet-gray-900">{input.name}</h3>
            <p className="text-sm text-bacnet-gray-600">
              AI{input.objectId} • {input.description || 'No description'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  min={input.minValue}
                  max={input.maxValue}
                  step={input.resolution}
                  className="w-24 px-2 py-1 border border-bacnet-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleSave}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                >
                  <SafeIcon icon={FiCheck} className="text-sm" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <SafeIcon icon={FiX} className="text-sm" />
                </button>
              </div>
            ) : (
              <>
                <div className={`text-lg font-bold ${getValueColor()}`}>
                  {input.presentValue.toFixed(2)} {input.units}
                </div>
                <div className="text-xs text-bacnet-gray-500">
                  Range: {input.minValue} - {input.maxValue}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              disabled={input.outOfService}
              className="p-2 text-bacnet-gray-600 hover:bg-bacnet-gray-200 rounded disabled:opacity-50"
            >
              <SafeIcon icon={FiEdit3} className="text-sm" />
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

export default AnalogInputCard;