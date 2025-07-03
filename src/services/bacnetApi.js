// Dynamic API base URL detection
const getApiBaseUrl = () => {
  // Try common ports
  const commonPorts = [3001, 3002, 3003, 3004, 3005];
  
  // In development, we'll use the default
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // For production, use relative path
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

class BACnetAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.retryPorts = [3001, 3002, 3003, 3004, 3005];
    this.currentPortIndex = 0;
  }

  async makeRequest(endpoint, options = {}) {
    const maxRetries = this.retryPorts.length;
    
    for (let i = 0; i < maxRetries; i++) {
      const port = this.retryPorts[this.currentPortIndex];
      const url = `http://localhost:${port}/api${endpoint}`;
      
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          // Update base URL if we found a working port
          this.baseURL = `http://localhost:${port}/api`;
          return response;
        }
      } catch (error) {
        console.warn(`Failed to connect to port ${port}:`, error.message);
        this.currentPortIndex = (this.currentPortIndex + 1) % this.retryPorts.length;
      }
    }
    
    throw new Error('Unable to connect to BACnet server on any port');
  }

  async getDevice() {
    const response = await this.makeRequest('/device');
    return response.json();
  }

  async updateDevice(deviceData) {
    const response = await this.makeRequest('/device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });
    return response.json();
  }

  async setDeviceOnline(isOnline) {
    const response = await this.makeRequest('/device/online', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isOnline }),
    });
    return response.json();
  }

  async getPoints() {
    const response = await this.makeRequest('/points');
    return response.json();
  }

  async addAnalogInput(inputData) {
    const response = await this.makeRequest('/points/analog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
    return response.json();
  }

  async addBinaryInput(inputData) {
    const response = await this.makeRequest('/points/binary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
    return response.json();
  }

  async updateAnalogInput(id, updates) {
    const response = await this.makeRequest(`/points/analog/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async updateBinaryInput(id, updates) {
    const response = await this.makeRequest(`/points/binary/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async deleteAnalogInput(id) {
    const response = await this.makeRequest(`/points/analog/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async deleteBinaryInput(id) {
    const response = await this.makeRequest(`/points/binary/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async updateSimulation(simulationData) {
    const response = await this.makeRequest('/simulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simulationData),
    });
    return response.json();
  }
}

export default new BACnetAPI();