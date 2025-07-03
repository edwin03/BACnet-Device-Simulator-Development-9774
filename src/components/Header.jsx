import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBACnet } from '../context/BACnetContext';
import ConnectionStatus from './ConnectionStatus';

const { FiHome, FiSettings, FiDatabase, FiPlay, FiWifi, FiWifiOff } = FiIcons;

function Header() {
  const location = useLocation();
  const { state } = useBACnet();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/device', label: 'Device', icon: FiSettings },
    { path: '/points', label: 'Points', icon: FiDatabase },
    { path: '/simulation', label: 'Simulation', icon: FiPlay }
  ];

  return (
    <header className="bg-white shadow-lg border-b border-bacnet-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-bacnet-primary rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiDatabase} className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-bacnet-gray-900">
                BACnet Simulator
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-bacnet-primary text-white'
                    : 'text-bacnet-gray-600 hover:bg-bacnet-gray-100'
                }`}
              >
                <SafeIcon icon={item.icon} className="text-sm" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                state.device.isOnline
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <SafeIcon icon={state.device.isOnline ? FiWifi : FiWifiOff} className="text-xs" />
              <span>
                {state.device.isOnline ? 'Online' : 'Offline'}
              </span>
            </motion.div>
            
            <div className="text-sm text-bacnet-gray-600">
              Device ID: {state.device.id}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;