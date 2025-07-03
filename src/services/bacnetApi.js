const API_BASE_URL = 'http://localhost:3001/api';

class BACnetAPI {
  async getDevice() {
    const response = await fetch(`${API_BASE_URL}/device`);
    if (!response.ok) throw new Error('Failed to fetch device');
    return response.json();
  }

  async updateDevice(deviceData) {
    const response = await fetch(`${API_BASE_URL}/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });
    if (!response.ok) throw new Error('Failed to update device');
    return response.json();
  }

  async setDeviceOnline(isOnline) {
    const response = await fetch(`${API_BASE_URL}/device/online`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isOnline }),
    });
    if (!response.ok) throw new Error('Failed to set device online status');
    return response.json();
  }

  async getPoints() {
    const response = await fetch(`${API_BASE_URL}/points`);
    if (!response.ok) throw new Error('Failed to fetch points');
    return response.json();
  }

  async addAnalogInput(inputData) {
    const response = await fetch(`${API_BASE_URL}/points/analog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
    if (!response.ok) throw new Error('Failed to add analog input');
    return response.json();
  }

  async addBinaryInput(inputData) {
    const response = await fetch(`${API_BASE_URL}/points/binary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
    if (!response.ok) throw new Error('Failed to add binary input');
    return response.json();
  }

  async updateAnalogInput(id, updates) {
    const response = await fetch(`${API_BASE_URL}/points/analog/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update analog input');
    return response.json();
  }

  async updateBinaryInput(id, updates) {
    const response = await fetch(`${API_BASE_URL}/points/binary/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update binary input');
    return response.json();
  }

  async deleteAnalogInput(id) {
    const response = await fetch(`${API_BASE_URL}/points/analog/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete analog input');
    return response.json();
  }

  async deleteBinaryInput(id) {
    const response = await fetch(`${API_BASE_URL}/points/binary/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete binary input');
    return response.json();
  }

  async updateSimulation(simulationData) {
    const response = await fetch(`${API_BASE_URL}/simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simulationData),
    });
    if (!response.ok) throw new Error('Failed to update simulation');
    return response.json();
  }
}

export default new BACnetAPI();