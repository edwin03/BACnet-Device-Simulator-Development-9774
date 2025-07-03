import bacnet from 'node-bacnet';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find available port
async function findAvailablePort(startPort = 3001) {
  const net = await import('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

// BACnet Client Configuration
const client = new bacnet({
  port: 47808,
  interface: '0.0.0.0',
  broadcastAddress: '255.255.255.255',
  adpuTimeout: 3000
});

// Express server for API communication with frontend
const app = express();
app.use(cors());
app.use(express.json());

// Device state management
let deviceState = {
  device: {
    id: 1001,
    name: 'BACnet Simulator Device',
    description: 'Virtual BACnet Device for Testing',
    vendorId: 999,
    modelName: 'Simulator v1.0',
    firmwareRevision: '1.0.0',
    applicationSoftwareVersion: '1.0.0',
    location: 'Virtual Environment',
    isOnline: true
  },
  analogInputs: [],
  binaryInputs: [],
  simulation: {
    isRunning: false,
    interval: 1000,
    autoUpdate: false
  }
};

// BACnet Object Types
const OBJECT_TYPES = {
  DEVICE: 8,
  ANALOG_INPUT: 0,
  BINARY_INPUT: 3
};

// BACnet Property IDs
const PROPERTY_IDS = {
  OBJECT_IDENTIFIER: 75,
  OBJECT_NAME: 77,
  OBJECT_TYPE: 79,
  PRESENT_VALUE: 85,
  DESCRIPTION: 28,
  DEVICE_TYPE: 31,
  SYSTEM_STATUS: 112,
  VENDOR_NAME: 121,
  VENDOR_IDENTIFIER: 120,
  MODEL_NAME: 70,
  FIRMWARE_REVISION: 44,
  APPLICATION_SOFTWARE_VERSION: 12,
  LOCATION: 58,
  UNITS: 117,
  OUT_OF_SERVICE: 81,
  RELIABILITY: 103,
  MIN_PRES_VALUE: 69,
  MAX_PRES_VALUE: 65,
  RESOLUTION: 106,
  POLARITY: 84
};

// Create BACnet objects for discovery
function createBACnetObjects() {
  const objects = [];
  
  // Device Object
  objects.push({
    objectId: { type: OBJECT_TYPES.DEVICE, instance: deviceState.device.id },
    properties: [
      { id: PROPERTY_IDS.OBJECT_IDENTIFIER, value: [{ type: OBJECT_TYPES.DEVICE, instance: deviceState.device.id }] },
      { id: PROPERTY_IDS.OBJECT_NAME, value: [{ type: 'string', value: deviceState.device.name }] },
      { id: PROPERTY_IDS.OBJECT_TYPE, value: [{ type: 'enum', value: OBJECT_TYPES.DEVICE }] },
      { id: PROPERTY_IDS.DESCRIPTION, value: [{ type: 'string', value: deviceState.device.description }] },
      { id: PROPERTY_IDS.VENDOR_NAME, value: [{ type: 'string', value: 'BACnet Simulator' }] },
      { id: PROPERTY_IDS.VENDOR_IDENTIFIER, value: [{ type: 'number', value: deviceState.device.vendorId }] },
      { id: PROPERTY_IDS.MODEL_NAME, value: [{ type: 'string', value: deviceState.device.modelName }] },
      { id: PROPERTY_IDS.FIRMWARE_REVISION, value: [{ type: 'string', value: deviceState.device.firmwareRevision }] },
      { id: PROPERTY_IDS.APPLICATION_SOFTWARE_VERSION, value: [{ type: 'string', value: deviceState.device.applicationSoftwareVersion }] },
      { id: PROPERTY_IDS.LOCATION, value: [{ type: 'string', value: deviceState.device.location }] },
      { id: PROPERTY_IDS.SYSTEM_STATUS, value: [{ type: 'enum', value: deviceState.device.isOnline ? 0 : 1 }] }
    ]
  });

  // Analog Input Objects
  deviceState.analogInputs.forEach((input, index) => {
    objects.push({
      objectId: { type: OBJECT_TYPES.ANALOG_INPUT, instance: input.objectId },
      properties: [
        { id: PROPERTY_IDS.OBJECT_IDENTIFIER, value: [{ type: OBJECT_TYPES.ANALOG_INPUT, instance: input.objectId }] },
        { id: PROPERTY_IDS.OBJECT_NAME, value: [{ type: 'string', value: input.name }] },
        { id: PROPERTY_IDS.OBJECT_TYPE, value: [{ type: 'enum', value: OBJECT_TYPES.ANALOG_INPUT }] },
        { id: PROPERTY_IDS.PRESENT_VALUE, value: [{ type: 'real', value: input.presentValue }] },
        { id: PROPERTY_IDS.DESCRIPTION, value: [{ type: 'string', value: input.description || '' }] },
        { id: PROPERTY_IDS.UNITS, value: [{ type: 'enum', value: getUnitsEnum(input.units) }] },
        { id: PROPERTY_IDS.OUT_OF_SERVICE, value: [{ type: 'boolean', value: input.outOfService }] },
        { id: PROPERTY_IDS.RELIABILITY, value: [{ type: 'enum', value: 0 }] },
        { id: PROPERTY_IDS.MIN_PRES_VALUE, value: [{ type: 'real', value: input.minValue }] },
        { id: PROPERTY_IDS.MAX_PRES_VALUE, value: [{ type: 'real', value: input.maxValue }] },
        { id: PROPERTY_IDS.RESOLUTION, value: [{ type: 'real', value: input.resolution }] }
      ]
    });
  });

  // Binary Input Objects
  deviceState.binaryInputs.forEach((input, index) => {
    objects.push({
      objectId: { type: OBJECT_TYPES.BINARY_INPUT, instance: input.objectId },
      properties: [
        { id: PROPERTY_IDS.OBJECT_IDENTIFIER, value: [{ type: OBJECT_TYPES.BINARY_INPUT, instance: input.objectId }] },
        { id: PROPERTY_IDS.OBJECT_NAME, value: [{ type: 'string', value: input.name }] },
        { id: PROPERTY_IDS.OBJECT_TYPE, value: [{ type: 'enum', value: OBJECT_TYPES.BINARY_INPUT }] },
        { id: PROPERTY_IDS.PRESENT_VALUE, value: [{ type: 'enum', value: input.presentValue === 'active' ? 1 : 0 }] },
        { id: PROPERTY_IDS.DESCRIPTION, value: [{ type: 'string', value: input.description || '' }] },
        { id: PROPERTY_IDS.OUT_OF_SERVICE, value: [{ type: 'boolean', value: input.outOfService }] },
        { id: PROPERTY_IDS.RELIABILITY, value: [{ type: 'enum', value: 0 }] },
        { id: PROPERTY_IDS.POLARITY, value: [{ type: 'enum', value: input.polarity === 'normal' ? 0 : 1 }] }
      ]
    });
  });

  return objects;
}

// Map units to BACnet enum values
function getUnitsEnum(units) {
  const unitMap = {
    'degrees-celsius': 62,
    'degrees-fahrenheit': 64,
    'degrees-kelvin': 63,
    'percent': 98,
    'pascals': 53,
    'kilopascals': 54,
    'bars': 55,
    'millibars': 134,
    'volts': 5,
    'millivolts': 124,
    'amperes': 2,
    'milliamperes': 125,
    'watts': 47,
    'kilowatts': 48,
    'megawatts': 49,
    'lumens': 36,
    'luxes': 179,
    'parts-per-million': 96,
    'parts-per-billion': 97
  };
  return unitMap[units] || 95; // no-units
}

// Handle BACnet Who-Is requests
client.on('iAm', (device) => {
  console.log('Received I-Am from device:', device);
});

// Handle BACnet Read Property requests
client.on('readProperty', (invokeId, address, objectId, propertyId, arrayIndex) => {
  console.log(`Read Property Request: Object ${objectId.type}:${objectId.instance}, Property ${propertyId}`);
  
  const objects = createBACnetObjects();
  const targetObject = objects.find(obj => 
    obj.objectId.type === objectId.type && 
    obj.objectId.instance === objectId.instance
  );

  if (targetObject) {
    const property = targetObject.properties.find(prop => prop.id === propertyId);
    if (property) {
      client.readPropertyResponse(address, invokeId, objectId, propertyId, arrayIndex, property.value);
    } else {
      client.errorResponse(address, invokeId, 32); // unknown-property
    }
  } else {
    client.errorResponse(address, invokeId, 31); // unknown-object
  }
});

// Handle BACnet Write Property requests
client.on('writeProperty', (invokeId, address, objectId, propertyId, arrayIndex, value, priority) => {
  console.log(`Write Property Request: Object ${objectId.type}:${objectId.instance}, Property ${propertyId}, Value:`, value);
  
  if (objectId.type === OBJECT_TYPES.ANALOG_INPUT && propertyId === PROPERTY_IDS.PRESENT_VALUE) {
    const input = deviceState.analogInputs.find(ai => ai.objectId === objectId.instance);
    if (input && !input.outOfService) {
      input.presentValue = value[0].value;
      input.lastUpdate = new Date().toISOString();
      client.simpleAckResponse(address, invokeId);
      return;
    }
  }
  
  if (objectId.type === OBJECT_TYPES.BINARY_INPUT && propertyId === PROPERTY_IDS.PRESENT_VALUE) {
    const input = deviceState.binaryInputs.find(bi => bi.objectId === objectId.instance);
    if (input && !input.outOfService) {
      input.presentValue = value[0].value === 1 ? 'active' : 'inactive';
      input.lastUpdate = new Date().toISOString();
      client.simpleAckResponse(address, invokeId);
      return;
    }
  }
  
  client.errorResponse(address, invokeId, 17); // write-access-denied
});

// Announce device presence
function announceDevice() {
  if (deviceState.device.isOnline) {
    console.log(`Announcing BACnet device ${deviceState.device.id}: ${deviceState.device.name}`);
    client.iAmResponse(
      deviceState.device.id,
      [1, 1, 1, 1], // segmentation support
      deviceState.device.vendorId
    );
  }
}

// Start BACnet services
function startBACnetServices() {
  console.log('Starting BACnet services...');
  console.log(`Device ID: ${deviceState.device.id}`);
  console.log(`Device Name: ${deviceState.device.name}`);
  console.log(`Listening on port 47808`);
  
  // Announce device every 30 seconds
  setInterval(announceDevice, 30000);
  
  // Initial announcement
  setTimeout(announceDevice, 2000);
}

// API Routes for frontend communication
app.get('/api/device', (req, res) => {
  res.json(deviceState);
});

app.post('/api/device', (req, res) => {
  deviceState.device = { ...deviceState.device, ...req.body };
  res.json(deviceState.device);
});

app.post('/api/device/online', (req, res) => {
  deviceState.device.isOnline = req.body.isOnline;
  if (deviceState.device.isOnline) {
    announceDevice();
  }
  res.json({ isOnline: deviceState.device.isOnline });
});

app.get('/api/points', (req, res) => {
  res.json({
    analogInputs: deviceState.analogInputs,
    binaryInputs: deviceState.binaryInputs
  });
});

app.post('/api/points/analog', (req, res) => {
  const newInput = {
    id: req.body.id || `ai_${Date.now()}`,
    objectId: deviceState.analogInputs.length + 1,
    name: req.body.name,
    description: req.body.description || '',
    presentValue: req.body.presentValue || 0,
    units: req.body.units || 'degrees-celsius',
    minValue: req.body.minValue || 0,
    maxValue: req.body.maxValue || 100,
    resolution: req.body.resolution || 0.1,
    outOfService: false,
    reliability: 'no-fault-detected',
    lastUpdate: new Date().toISOString()
  };
  
  deviceState.analogInputs.push(newInput);
  res.json(newInput);
});

app.post('/api/points/binary', (req, res) => {
  const newInput = {
    id: req.body.id || `bi_${Date.now()}`,
    objectId: deviceState.binaryInputs.length + 1,
    name: req.body.name,
    description: req.body.description || '',
    presentValue: req.body.presentValue || 'inactive',
    polarity: req.body.polarity || 'normal',
    outOfService: false,
    reliability: 'no-fault-detected',
    lastUpdate: new Date().toISOString()
  };
  
  deviceState.binaryInputs.push(newInput);
  res.json(newInput);
});

app.put('/api/points/analog/:id', (req, res) => {
  const input = deviceState.analogInputs.find(ai => ai.id === req.params.id);
  if (input) {
    Object.assign(input, req.body);
    input.lastUpdate = new Date().toISOString();
    res.json(input);
  } else {
    res.status(404).json({ error: 'Analog input not found' });
  }
});

app.put('/api/points/binary/:id', (req, res) => {
  const input = deviceState.binaryInputs.find(bi => bi.id === req.params.id);
  if (input) {
    Object.assign(input, req.body);
    input.lastUpdate = new Date().toISOString();
    res.json(input);
  } else {
    res.status(404).json({ error: 'Binary input not found' });
  }
});

app.delete('/api/points/analog/:id', (req, res) => {
  const index = deviceState.analogInputs.findIndex(ai => ai.id === req.params.id);
  if (index !== -1) {
    deviceState.analogInputs.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Analog input not found' });
  }
});

app.delete('/api/points/binary/:id', (req, res) => {
  const index = deviceState.binaryInputs.findIndex(bi => bi.id === req.params.id);
  if (index !== -1) {
    deviceState.binaryInputs.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Binary input not found' });
  }
});

app.post('/api/simulation', (req, res) => {
  deviceState.simulation = { ...deviceState.simulation, ...req.body };
  res.json(deviceState.simulation);
});

// Start servers with port detection
async function startServers() {
  try {
    // Find available port for API server
    const apiPort = await findAvailablePort(3001);
    
    // Start API server
    const server = app.listen(apiPort, () => {
      console.log(`✅ API server running on port ${apiPort}`);
      console.log(`📡 Web interface will be available at http://localhost:5174`);
      console.log(`🔗 API endpoint: http://localhost:${apiPort}/api`);
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${apiPort} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });

    // Initialize BACnet services
    startBACnetServices();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...');
      server.close(() => {
        console.log('✅ Servers closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start servers:', error);
    process.exit(1);
  }
}

// Start the application
startServers();