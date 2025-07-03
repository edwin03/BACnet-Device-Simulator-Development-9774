import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import bacnetApi from '../services/bacnetApi';

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
  logs: [],
  isConnected: false,
  connectionAttempts: 0,
  lastConnectionAttempt: null
};

function bacnetReducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload, connectionAttempts: 0 };
    case 'INCREMENT_CONNECTION_ATTEMPTS':
      return { 
        ...state, 
        connectionAttempts: state.connectionAttempts + 1,
        lastConnectionAttempt: new Date().toISOString()
      };
    case 'SYNC_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_DEVICE':
      return { ...state, device: { ...state.device, ...action.payload } };
    case 'SET_DEVICE_ONLINE':
      return { ...state, device: { ...state.device, isOnline: action.payload } };
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
      return { ...state, analogInputs: [...state.analogInputs, newAnalogInput] };
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
      return { ...state, binaryInputs: [...state.binaryInputs, newBinaryInput] };
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
      return { ...state, analogInputs: state.analogInputs.filter(input => input.id !== action.payload) };
    case 'DELETE_BINARY_INPUT':
      return { ...state, binaryInputs: state.binaryInputs.filter(input => input.id !== action.payload) };
    case 'UPDATE_SIMULATION':
      return { ...state, simulation: { ...state.simulation, ...action.payload } };
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
      return { ...state, logs: [] };
    default:
      return state;
  }
}

export function BACnetProvider({ children }) {
  const [state, dispatch] = useReducer(bacnetReducer, initialState);

  // Connect to BACnet server with improved retry logic
  useEffect(() => {
    let retryTimeout;
    let syncInterval;

    const connectToServer = async () => {
      try {
        dispatch({ type: 'INCREMENT_CONNECTION_ATTEMPTS' });
        
        const deviceData = await bacnetApi.getDevice();
        dispatch({ type: 'SYNC_STATE', payload: deviceData });
        dispatch({ type: 'SET_CONNECTED', payload: true });
        
        // Only log success on first connection or after being disconnected
        if (!state.isConnected) {
          dispatch({
            type: 'ADD_LOG',
            payload: {
              level: 'success',
              message: 'Connected to BACnet server',
              category: 'connection'
            }
          });
        }
      } catch (error) {
        console.warn('Connection attempt failed:', error.message);
        
        if (state.isConnected) {
          dispatch({ type: 'SET_CONNECTED', payload: false });
          dispatch({
            type: 'ADD_LOG',
            payload: {
              level: 'warning',
              message: 'Lost connection to BACnet server',
              category: 'connection'
            }
          });
        }
        
        // Only log error after multiple attempts
        if (state.connectionAttempts >= 3) {
          dispatch({
            type: 'ADD_LOG',
            payload: {
              level: 'error',
              message: 'Failed to connect to BACnet server. Make sure the server is running.',
              category: 'connection'
            }
          });
        }
      }
    };

    // Initial connection attempt with delay
    const initialConnect = () => {
      setTimeout(connectToServer, 1000); // Wait 1 second before first attempt
    };

    // Start initial connection
    initialConnect();

    // Set up periodic sync only after initial connection
    const setupSync = () => {
      syncInterval = setInterval(() => {
        if (state.isConnected) {
          connectToServer();
        } else {
          // Retry connection every 5 seconds when disconnected
          connectToServer();
        }
      }, state.isConnected ? 10000 : 5000); // 10s when connected, 5s when disconnected
    };

    // Setup sync after initial delay
    setTimeout(setupSync, 2000);

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [state.isConnected, state.connectionAttempts]);

  // Auto-update simulation
  useEffect(() => {
    if (state.simulation.isRunning && state.simulation.autoUpdate && state.isConnected) {
      const interval = setInterval(() => {
        // Update analog inputs with random variations
        state.analogInputs.forEach(async (input) => {
          if (!input.outOfService) {
            const variation = (Math.random() - 0.5) * 2; // -1 to 1
            const newValue = Math.max(
              input.minValue,
              Math.min(input.maxValue, input.presentValue + variation)
            );
            
            try {
              await bacnetApi.updateAnalogInput(input.id, {
                presentValue: Number(newValue.toFixed(2))
              });
            } catch (error) {
              console.error('Failed to update analog input:', error);
            }
          }
        });

        // Randomly toggle binary inputs
        state.binaryInputs.forEach(async (input) => {
          if (!input.outOfService && Math.random() < 0.1) { // 10% chance to toggle
            const newValue = input.presentValue === 'active' ? 'inactive' : 'active';
            try {
              await bacnetApi.updateBinaryInput(input.id, { presentValue: newValue });
            } catch (error) {
              console.error('Failed to update binary input:', error);
            }
          }
        });
      }, state.simulation.interval);

      return () => clearInterval(interval);
    }
  }, [state.simulation.isRunning, state.simulation.autoUpdate, state.simulation.interval, state.analogInputs, state.binaryInputs, state.isConnected]);

  const value = {
    state,
    dispatch,
    actions: {
      updateDevice: async (updates) => {
        dispatch({ type: 'UPDATE_DEVICE', payload: updates });
        if (state.isConnected) {
          try {
            await bacnetApi.updateDevice(updates);
          } catch (error) {
            console.error('Failed to update device:', error);
          }
        }
      },
      setDeviceOnline: async (online) => {
        dispatch({ type: 'SET_DEVICE_ONLINE', payload: online });
        if (state.isConnected) {
          try {
            await bacnetApi.setDeviceOnline(online);
          } catch (error) {
            console.error('Failed to set device online:', error);
          }
        }
      },
      addAnalogInput: async (input) => {
        dispatch({ type: 'ADD_ANALOG_INPUT', payload: input });
        if (state.isConnected) {
          try {
            await bacnetApi.addAnalogInput(input);
          } catch (error) {
            console.error('Failed to add analog input:', error);
          }
        }
      },
      addBinaryInput: async (input) => {
        dispatch({ type: 'ADD_BINARY_INPUT', payload: input });
        if (state.isConnected) {
          try {
            await bacnetApi.addBinaryInput(input);
          } catch (error) {
            console.error('Failed to add binary input:', error);
          }
        }
      },
      updateAnalogInput: async (id, updates) => {
        dispatch({ type: 'UPDATE_ANALOG_INPUT', payload: { id, updates } });
        if (state.isConnected) {
          try {
            await bacnetApi.updateAnalogInput(id, updates);
          } catch (error) {
            console.error('Failed to update analog input:', error);
          }
        }
      },
      updateBinaryInput: async (id, updates) => {
        dispatch({ type: 'UPDATE_BINARY_INPUT', payload: { id, updates } });
        if (state.isConnected) {
          try {
            await bacnetApi.updateBinaryInput(id, updates);
          } catch (error) {
            console.error('Failed to update binary input:', error);
          }
        }
      },
      deleteAnalogInput: async (id) => {
        dispatch({ type: 'DELETE_ANALOG_INPUT', payload: id });
        if (state.isConnected) {
          try {
            await bacnetApi.deleteAnalogInput(id);
          } catch (error) {
            console.error('Failed to delete analog input:', error);
          }
        }
      },
      deleteBinaryInput: async (id) => {
        dispatch({ type: 'DELETE_BINARY_INPUT', payload: id });
        if (state.isConnected) {
          try {
            await bacnetApi.deleteBinaryInput(id);
          } catch (error) {
            console.error('Failed to delete binary input:', error);
          }
        }
      },
      updateSimulation: async (updates) => {
        dispatch({ type: 'UPDATE_SIMULATION', payload: updates });
        if (state.isConnected) {
          try {
            await bacnetApi.updateSimulation(updates);
          } catch (error) {
            console.error('Failed to update simulation:', error);
          }
        }
      },
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