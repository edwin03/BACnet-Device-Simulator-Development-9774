class BACnetAPI {
  constructor() {
    this.retryPorts = [3001, 3002, 3003, 3004, 3005];
    this.currentPortIndex = 0;
    this.baseURL = null;
    this.lastWorkingPort = null;
  }

  async makeRequest(endpoint, options = {}) {
    // If we have a working port, try it first
    if (this.lastWorkingPort) {
      try {
        const url = `http://localhost:${this.lastWorkingPort}/api${endpoint}`;
        const response = await fetch(url, {
          ...options,
          timeout: 5000 // 5 second timeout
        });
        
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Last working port ${this.lastWorkingPort} failed:`, error.message);
        this.lastWorkingPort = null;
      }
    }

    // Try all ports
    const maxRetries = this.retryPorts.length;
    let lastError = null;
    
    for (let i = 0; i < maxRetries; i++) {
      const port = this.retryPorts[this.currentPortIndex];
      const url = `http://localhost:${port}/api${endpoint}`;
      
      try {
        const response = await fetch(url, {
          ...options,
          timeout: 3000 // 3 second timeout per port
        });
        
        if (response.ok) {
          this.lastWorkingPort = port;
          this.baseURL = `http://localhost:${port}/api`;
          return response;
        } else {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error;
        console.warn(`Port ${port} failed:`, error.message);
      }
      
      this.currentPortIndex = (this.currentPortIndex + 1) % this.retryPorts.length;
    }
    
    throw lastError || new Error('Unable to connect to BACnet server on any port');
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