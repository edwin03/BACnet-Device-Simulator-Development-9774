import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BACnetContext = createContext();

const initialState = {
  device: {
    id: 1001,
    name: 'BACnet Simulator Device',
    description: 'Virtual BACnet Device for Testing',
    vendorId: 999,
    modelName: 'Simulator v1.0',
    firmwareRevision: '1.0.0',
    applicationSoftwareVersion: '1.0.0',
    location: 'Virtual Environment',
    isOnline: false
  },
  analogInputs: [],
  binaryInputs: [],
  simulation: {
    isRunning: false,
    interval: 1000,
    autoUpdate: false
  },
  logs: []
};

function bacnetReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DEVICE':
      return {
        ...state,
        device: { ...state.device, ...action.payload }
      };

    case 'SET_DEVICE_ONLINE':
      return {
        ...state,
        device: { ...state.device, isOnline: action.payload }
      };

    case 'ADD_ANALOG_INPUT':
      const newAnalogInput = {
        id: uuidv4(),
        objectId: state.analogInputs.length + 1,
        name: action.payload.name || `AI_${state.analogInputs.length + 1}`,
        description: action.payload.description || '',
        presentValue: action.payload.presentValue || 0,
        units: action.payload.units || 'degrees-celsius',
        minValue: action.payload.minValue || 0,
        maxValue: action.payload.maxValue || 100,
        resolution: action.payload.resolution || 0.1,
        outOfService: false,
        reliability: 'no-fault-detected',
        lastUpdate: new Date().toISOString()
      };
      return {
        ...state,
        analogInputs: [...state.analogInputs, newAnalogInput]
      };

    case 'ADD_BINARY_INPUT':
      const newBinaryInput = {
        id: uuidv4(),
        objectId: state.binaryInputs.length + 1,
        name: action.payload.name || `BI_${state.binaryInputs.length + 1}`,
        description: action.payload.description || '',
        presentValue: action.payload.presentValue || 'inactive',
        polarity: action.payload.polarity || 'normal',
        outOfService: false,
        reliability: 'no-fault-detected',
        lastUpdate: new Date().toISOString()
      };
      return {
        ...state,
        binaryInputs: [...state.binaryInputs, newBinaryInput]
      };

    case 'UPDATE_ANALOG_INPUT':
      return {
        ...state,
        analogInputs: state.analogInputs.map(input =>
          input.id === action.payload.id
            ? { ...input, ...action.payload.updates, lastUpdate: new Date().toISOString() }
            : input
        )
      };

    case 'UPDATE_BINARY_INPUT':
      return {
        ...state,
        binaryInputs: state.binaryInputs.map(input =>
          input.id === action.payload.id
            ? { ...input, ...action.payload.updates, lastUpdate: new Date().toISOString() }
            : input
        )
      };

    case 'DELETE_ANALOG_INPUT':
      return {
        ...state,
        analogInputs: state.analogInputs.filter(input => input.id !== action.payload)
      };

    case 'DELETE_BINARY_INPUT':
      return {
        ...state,
        binaryInputs: state.binaryInputs.filter(input => input.id !== action.payload)
      };

    case 'UPDATE_SIMULATION':
      return {
        ...state,
        simulation: { ...state.simulation, ...action.payload }
      };

    case 'ADD_LOG':
      return {
        ...state,
        logs: [
          {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            level: action.payload.level || 'info',
            message: action.payload.message,
            category: action.payload.category || 'general'
          },
          ...state.logs.slice(0, 99) // Keep only last 100 logs
        ]
      };

    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: []
      };

    default:
      return state;
  }
}

export function BACnetProvider({ children }) {
  const [state, dispatch] = useReducer(bacnetReducer, initialState);

  // Auto-update simulation
  useEffect(() => {
    if (state.simulation.isRunning && state.simulation.autoUpdate) {
      const interval = setInterval(() => {
        // Update analog inputs with random variations
        state.analogInputs.forEach(input => {
          if (!input.outOfService) {
            const variation = (Math.random() - 0.5) * 2; // -1 to 1
            const newValue = Math.max(
              input.minValue,
              Math.min(
                input.maxValue,
                input.presentValue + variation
              )
            );
            
            dispatch({
              type: 'UPDATE_ANALOG_INPUT',
              payload: {
                id: input.id,
                updates: { presentValue: Number(newValue.toFixed(2)) }
              }
            });
          }
        });

        // Randomly toggle binary inputs
        state.binaryInputs.forEach(input => {
          if (!input.outOfService && Math.random() < 0.1) { // 10% chance to toggle
            const newValue = input.presentValue === 'active' ? 'inactive' : 'active';
            dispatch({
              type: 'UPDATE_BINARY_INPUT',
              payload: {
                id: input.id,
                updates: { presentValue: newValue }
              }
            });
          }
        });
      }, state.simulation.interval);

      return () => clearInterval(interval);
    }
  }, [state.simulation.isRunning, state.simulation.autoUpdate, state.simulation.interval, state.analogInputs, state.binaryInputs]);

  const value = {
    state,
    dispatch,
    actions: {
      updateDevice: (updates) => dispatch({ type: 'UPDATE_DEVICE', payload: updates }),
      setDeviceOnline: (online) => dispatch({ type: 'SET_DEVICE_ONLINE', payload: online }),
      addAnalogInput: (input) => dispatch({ type: 'ADD_ANALOG_INPUT', payload: input }),
      addBinaryInput: (input) => dispatch({ type: 'ADD_BINARY_INPUT', payload: input }),
      updateAnalogInput: (id, updates) => dispatch({ type: 'UPDATE_ANALOG_INPUT', payload: { id, updates } }),
      updateBinaryInput: (id, updates) => dispatch({ type: 'UPDATE_BINARY_INPUT', payload: { id, updates } }),
      deleteAnalogInput: (id) => dispatch({ type: 'DELETE_ANALOG_INPUT', payload: id }),
      deleteBinaryInput: (id) => dispatch({ type: 'DELETE_BINARY_INPUT', payload: id }),
      updateSimulation: (updates) => dispatch({ type: 'UPDATE_SIMULATION', payload: updates }),
      addLog: (log) => dispatch({ type: 'ADD_LOG', payload: log }),
      clearLogs: () => dispatch({ type: 'CLEAR_LOGS' })
    }
  };

  return (
    <BACnetContext.Provider value={value}>
      {children}
    </BACnetContext.Provider>
  );
}

export function useBACnet() {
  const context = useContext(BACnetContext);
  if (!context) {
    throw new Error('useBACnet must be used within a BACnetProvider');
  }
  return context;
}