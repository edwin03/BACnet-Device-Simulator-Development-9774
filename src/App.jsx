import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import DeviceManager from './components/DeviceManager';
import PointsManager from './components/PointsManager';
import SimulationControl from './components/SimulationControl';
import StatusPanel from './components/StatusPanel';
import ServerStatus from './components/ServerStatus';
import { BACnetProvider } from './context/BACnetContext';

function App() {
  return (
    <BACnetProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-bacnet-gray-50 to-bacnet-gray-100">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <ServerStatus />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/device" element={<DeviceManager />} />
              <Route path="/points" element={<PointsManager />} />
              <Route path="/simulation" element={<SimulationControl />} />
            </Routes>
          </main>
        </div>
      </Router>
    </BACnetProvider>
  );
}

function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-bacnet-gray-900 mb-4">
          BACnet Device Simulator
        </h1>
        <p className="text-lg text-bacnet-gray-600 max-w-2xl mx-auto">
          Simulate BACnet devices with configurable analog and binary inputs. 
          Perfect for testing and development of BACnet applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <DeviceManager />
          <SimulationControl />
        </div>
        <div className="space-y-6">
          <StatusPanel />
          <PointsManager />
        </div>
      </div>
    </motion.div>
  );
}

export default App;