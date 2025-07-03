import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';
import AnalogInputCard from './AnalogInputCard';
import BinaryInputCard from './BinaryInputCard';
import AddPointModal from './AddPointModal';

const { FiDatabase, FiPlus, FiFilter } = FiIcons;

function PointsManager() {
  const { state } = useBACnet();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const totalPoints = state.analogInputs.length + state.binaryInputs.length;
  const activePoints = [...state.analogInputs, ...state.binaryInputs].filter(
    point => !point.outOfService
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-bacnet-primary rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiDatabase} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-bacnet-gray-900">
              Points Manager
            </h2>
            <p className="text-sm text-bacnet-gray-600">
              {totalPoints} total points, {activePoints} active
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent"
          >
            <option value="all">All Points</option>
            <option value="analog">Analog Inputs</option>
            <option value="binary">Binary Inputs</option>
            <option value="active">Active Only</option>
            <option value="inactive">Out of Service</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-bacnet-primary text-white rounded-lg hover:bg-bacnet-secondary transition-colors"
          >
            <SafeIcon icon={FiPlus} className="text-sm" />
            <span>Add Point</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filter === 'all' || filter === 'analog' || filter === 'active' || filter === 'inactive' ? (
            state.analogInputs
              .filter(point => {
                if (filter === 'active') return !point.outOfService;
                if (filter === 'inactive') return point.outOfService;
                return true;
              })
              .map((input) => (
                <AnalogInputCard key={input.id} input={input} />
              ))
          ) : null}

          {filter === 'all' || filter === 'binary' || filter === 'active' || filter === 'inactive' ? (
            state.binaryInputs
              .filter(point => {
                if (filter === 'active') return !point.outOfService;
                if (filter === 'inactive') return point.outOfService;
                return true;
              })
              .map((input) => (
                <BinaryInputCard key={input.id} input={input} />
              ))
          ) : null}
        </AnimatePresence>

        {totalPoints === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-bacnet-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiDatabase} className="text-2xl text-bacnet-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-bacnet-gray-900 mb-2">
              No Points Configured
            </h3>
            <p className="text-bacnet-gray-600 mb-4">
              Get started by adding your first analog or binary input point.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-bacnet-primary text-white rounded-lg hover:bg-bacnet-secondary transition-colors mx-auto"
            >
              <SafeIcon icon={FiPlus} className="text-sm" />
              <span>Add Your First Point</span>
            </button>
          </div>
        )}
      </div>

      <AddPointModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </motion.div>
  );
}

export default PointsManager;