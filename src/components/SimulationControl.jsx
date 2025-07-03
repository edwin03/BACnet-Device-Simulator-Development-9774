import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';

const { FiPlay, FiPause, FiSettings, FiRefreshCw, FiClock } = FiIcons;

function SimulationControl() {
  const { state, actions } = useBACnet();

  const toggleSimulation = () => {
    const newState = !state.simulation.isRunning;
    actions.updateSimulation({ isRunning: newState });
    actions.addLog({
      level: newState ? 'success' : 'info',
      message: `Simulation ${newState ? 'started' : 'stopped'}`,
      category: 'simulation'
    });
  };

  const toggleAutoUpdate = () => {
    const newState = !state.simulation.autoUpdate;
    actions.updateSimulation({ autoUpdate: newState });
    actions.addLog({
      level: 'info',
      message: `Auto-update ${newState ? 'enabled' : 'disabled'}`,
      category: 'simulation'
    });
  };

  const updateInterval = (interval) => {
    actions.updateSimulation({ interval });
    actions.addLog({
      level: 'info',
      message: `Update interval changed to ${interval}ms`,
      category: 'simulation'
    });
  };

  const intervalOptions = [
    { value: 500, label: '500ms' },
    { value: 1000, label: '1s' },
    { value: 2000, label: '2s' },
    { value: 5000, label: '5s' },
    { value: 10000, label: '10s' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-bacnet-accent rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiSettings} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-bacnet-gray-900">
            Simulation Control
          </h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          state.simulation.isRunning
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {state.simulation.isRunning ? 'Running' : 'Stopped'}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-bacnet-gray-900">Simulation Status</h3>
            <p className="text-sm text-bacnet-gray-600">
              Start or stop the simulation engine
            </p>
          </div>
          <button
            onClick={toggleSimulation}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              state.simulation.isRunning
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <SafeIcon 
              icon={state.simulation.isRunning ? FiPause : FiPlay} 
              className="text-sm" 
            />
            <span>
              {state.simulation.isRunning ? 'Stop' : 'Start'} Simulation
            </span>
          </button>
        </div>

        <div className="border-t border-bacnet-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-bacnet-gray-900">Auto-Update Values</h3>
              <p className="text-sm text-bacnet-gray-600">
                Automatically change point values during simulation
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.simulation.autoUpdate}
                onChange={toggleAutoUpdate}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiClock} className="text-bacnet-gray-600" />
              <span className="text-sm text-bacnet-gray-700">Update Interval</span>
            </div>
            <select
              value={state.simulation.interval}
              onChange={(e) => updateInterval(parseInt(e.target.value))}
              disabled={!state.simulation.autoUpdate}
              className="px-3 py-2 border border-bacnet-gray-300 rounded-lg focus:ring-2 focus:ring-bacnet-primary focus:border-transparent disabled:opacity-50"
            >
              {intervalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-bacnet-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-bacnet-gray-50 p-3 rounded-lg">
              <div className="text-bacnet-gray-600">Total Points</div>
              <div className="text-lg font-bold text-bacnet-gray-900">
                {state.analogInputs.length + state.binaryInputs.length}
              </div>
            </div>
            <div className="bg-bacnet-gray-50 p-3 rounded-lg">
              <div className="text-bacnet-gray-600">Active Points</div>
              <div className="text-lg font-bold text-bacnet-gray-900">
                {[...state.analogInputs, ...state.binaryInputs].filter(p => !p.outOfService).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SimulationControl;