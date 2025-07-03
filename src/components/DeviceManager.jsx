import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';

const { FiSettings, FiSave, FiEdit3, FiCheck, FiX } = FiIcons;

function DeviceManager() {
  const { state, actions } = useBACnet();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(state.device);

  const handleEdit = () => {
    setFormData(state.device);
    setIsEditing(true);
  };

  const handleSave = () => {
    actions.updateDevice(formData);
    setIsEditing(false);
    actions.addLog({
      level: 'info',
      message: 'Device configuration updated',
      category: 'device'
    });
  };

  const handleCancel = () => {
    setFormData(state.device);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleOnline = () => {
    const newStatus = !state.device.isOnline;
    actions.setDeviceOnline(newStatus);
    actions.addLog({
      level: newStatus ? 'success' : 'warning',
      message: `Device ${newStatus ? 'connected' : 'disconnected'}`,
      category: 'device'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-bacnet-primary rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiSettings} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-bacnet-gray-900">
            Device Configuration
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <SafeIcon icon={FiCheck} className="text-sm" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <SafeIcon icon={FiX} className="text-sm" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-bacnet-primary text-white rounded-lg hover:bg-bacnet-secondary transition-colors"
            >
              <SafeIcon icon={FiEdit3} className="text-sm" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Device ID
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.id}
                onChange={(e) => handleInputChange('id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.id}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Device Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.description}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.location}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Vendor ID
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.vendorId}
                onChange={(e) => handleInputChange('vendorId', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.vendorId}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Model Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) => handleInputChange('modelName', e.target.value)}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.modelName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Firmware Revision
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firmwareRevision}
                onChange={(e) => handleInputChange('firmwareRevision', e.target.value)}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.firmwareRevision}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
              Application Software Version
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.applicationSoftwareVersion}
                onChange={(e) => handleInputChange('applicationSoftwareVersion', e.target.value)}
                className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-bacnet-gray-50 rounded-lg">
                {state.device.applicationSoftwareVersion}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isEditing && (
        <div className="mt-6 pt-6 border-t border-bacnet-gray-200">
          <button
            onClick={toggleOnline}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              state.device.isOnline
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <span>
              {state.device.isOnline ? 'Go Offline' : 'Go Online'}
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default DeviceManager;