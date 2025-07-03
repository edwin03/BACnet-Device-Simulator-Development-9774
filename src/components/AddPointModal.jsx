import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';

const { FiX, FiPlus, FiTrendingUp, FiToggleLeft } = FiIcons;

function AddPointModal({ isOpen, onClose }) {
  const { actions } = useBACnet();
  const [pointType, setPointType] = useState('analog');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    presentValue: 0,
    units: 'degrees-celsius',
    minValue: 0,
    maxValue: 100,
    resolution: 0.1,
    polarity: 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (pointType === 'analog') {
      actions.addAnalogInput({
        name: formData.name,
        description: formData.description,
        presentValue: parseFloat(formData.presentValue),
        units: formData.units,
        minValue: parseFloat(formData.minValue),
        maxValue: parseFloat(formData.maxValue),
        resolution: parseFloat(formData.resolution)
      });
      actions.addLog({
        level: 'success',
        message: `Analog Input ${formData.name} added`,
        category: 'points'
      });
    } else {
      actions.addBinaryInput({
        name: formData.name,
        description: formData.description,
        presentValue: formData.presentValue === 'true' ? 'active' : 'inactive',
        polarity: formData.polarity
      });
      actions.addLog({
        level: 'success',
        message: `Binary Input ${formData.name} added`,
        category: 'points'
      });
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      presentValue: 0,
      units: 'degrees-celsius',
      minValue: 0,
      maxValue: 100,
      resolution: 0.1,
      polarity: 'normal'
    });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const unitOptions = [
    'degrees-celsius',
    'degrees-fahrenheit',
    'degrees-kelvin',
    'percent',
    'pascals',
    'kilopascals',
    'bars',
    'millibars',
    'volts',
    'millivolts',
    'amperes',
    'milliamperes',
    'watts',
    'kilowatts',
    'megawatts',
    'lumens',
    'luxes',
    'parts-per-million',
    'parts-per-billion'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-bacnet-gray-900">
                  Add New Point
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-bacnet-gray-600 hover:bg-bacnet-gray-100 rounded-lg"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bacnet-gray-700 mb-2">
                    Point Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPointType('analog')}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        pointType === 'analog'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-bacnet-gray-300 text-bacnet-gray-700 hover:bg-bacnet-gray-50'
                      }`}
                    >
                      <SafeIcon icon={FiTrendingUp} />
                      <span>Analog</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPointType('binary')}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        pointType === 'binary'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-bacnet-gray-300 text-bacnet-gray-700 hover:bg-bacnet-gray-50'
                      }`}
                    >
                      <SafeIcon icon={FiToggleLeft} />
                      <span>Binary</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                    placeholder={`Enter ${pointType} input name`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>

                {pointType === 'analog' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                        Initial Value
                      </label>
                      <input
                        type="number"
                        value={formData.presentValue}
                        onChange={(e) => handleInputChange('presentValue', e.target.value)}
                        step={formData.resolution}
                        className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                        Units
                      </label>
                      <select
                        value={formData.units}
                        onChange={(e) => handleInputChange('units', e.target.value)}
                        className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                      >
                        {unitOptions.map(unit => (
                          <option key={unit} value={unit}>
                            {unit.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                          Min Value
                        </label>
                        <input
                          type="number"
                          value={formData.minValue}
                          onChange={(e) => handleInputChange('minValue', e.target.value)}
                          className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                          Max Value
                        </label>
                        <input
                          type="number"
                          value={formData.maxValue}
                          onChange={(e) => handleInputChange('maxValue', e.target.value)}
                          className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                        Resolution
                      </label>
                      <input
                        type="number"
                        value={formData.resolution}
                        onChange={(e) => handleInputChange('resolution', e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                        Initial State
                      </label>
                      <select
                        value={formData.presentValue}
                        onChange={(e) => handleInputChange('presentValue', e.target.value)}
                        className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                      >
                        <option value="false">Inactive</option>
                        <option value="true">Active</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-bacnet-gray-700 mb-1">
                        Polarity
                      </label>
                      <select
                        value={formData.polarity}
                        onChange={(e) => handleInputChange('polarity', e.target.value)}
                        className="w-full px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
                      >
                        <option value="normal">Normal</option>
                        <option value="reverse">Reverse</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-bacnet-gray-600 hover:bg-bacnet-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-bacnet-primary text-white rounded-lg hover:bg-bacnet-secondary transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="text-sm" />
                    <span>Add Point</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AddPointModal;