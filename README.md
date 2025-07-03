# BACnet Device Simulator

A professional BACnet device simulator that creates a real, discoverable BACnet device on your network. This simulator can be discovered and interacted with by any BACnet client software.

## Features

- **Real BACnet Device**: Creates an actual BACnet device discoverable on your network
- **Device Management**: Configure device properties, vendor information, and status
- **Analog Inputs**: Create and manage analog input objects with configurable ranges and units
- **Binary Inputs**: Create and manage binary input objects with configurable polarity
- **Live Simulation**: Real-time value updates and automatic point variations
- **BACnet Protocol Support**: Full BACnet/IP protocol implementation
- **Web Interface**: Modern React-based UI for easy configuration and monitoring

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the BACnet Server**:
   ```bash
   npm run server
   ```

3. **Start the Web Interface** (in a new terminal):
   ```bash
   npm run dev
   ```

4. **Or Start Both Together**:
   ```bash
   npm run dev:full
   ```

## BACnet Discovery

The simulator creates a real BACnet device that can be discovered by:

- **BACnet Clients**: Any BACnet client software (like BACnet Browser, BACnet Explorer, etc.)
- **Building Automation Systems**: Integration with BAS systems
- **Testing Tools**: Perfect for testing BACnet applications

### Network Configuration

- **Port**: 47808 (standard BACnet/IP port)
- **Device ID**: Configurable (default: 1001)
- **Vendor ID**: 999 (simulator vendor)
- **Discovery**: Device announces itself via I-Am broadcasts

## Usage

### Device Configuration

1. Navigate to the **Device** tab
2. Configure device properties:
   - Device ID and Name
   - Vendor information
   - Location and description
   - Firmware versions
3. Set device online/offline status

### Adding Points

1. Go to the **Points** tab
2. Click **Add Point**
3. Choose point type (Analog or Binary)
4. Configure point properties:
   - **Analog**: Name, units, range, resolution
   - **Binary**: Name, polarity, initial state

### Simulation Control

1. Visit the **Simulation** tab
2. Start/stop the simulation engine
3. Enable auto-update for realistic value changes
4. Configure update intervals

### Monitoring

- **Dashboard**: Overview of all components
- **Activity Log**: Real-time logs of all operations
- **Point Status**: Live values and reliability information

## BACnet Objects

The simulator creates standard BACnet objects:

### Device Object
- Object Type: Device (8)
- Properties: Name, Description, Vendor Info, System Status

### Analog Input Objects
- Object Type: Analog Input (0)
- Properties: Present Value, Units, Min/Max Values, Resolution
- Configurable engineering units (°C, °F, %, V, A, etc.)

### Binary Input Objects
- Object Type: Binary Input (3)
- Properties: Present Value, Polarity
- States: Active/Inactive

## Network Requirements

- **Firewall**: Ensure port 47808 (UDP) is open
- **Network**: Device must be on the same network as BACnet clients
- **Broadcast**: UDP broadcast must be enabled on the network

## Testing BACnet Discovery

### Using BACnet Browser Tools

1. **YaBe (Yet another BACnet Explorer)**:
   - Download and install YaBe
   - Start device discovery
   - Look for "BACnet Simulator Device" with ID 1001

2. **BACnet4J Tools**:
   - Use BACnet4J library tools
   - Perform Who-Is request
   - Device will respond with I-Am

3. **Command Line Testing**:
   ```bash
   # Install BACnet testing tools
   npm install bacnet-client
   
   # Discover devices
   bacnet-client discover
   ```

### Expected Discovery Response

When discovered, the device will respond with:
- Device ID: 1001 (configurable)
- Vendor ID: 999
- Device Name: "BACnet Simulator Device"
- All configured analog and binary inputs

## Troubleshooting

### Device Not Discovered

1. **Check Network**: Ensure device is on same network as client
2. **Firewall**: Verify port 47808 is open
3. **Server Status**: Confirm BACnet server is running
4. **Device Online**: Set device to online status in web interface

### Connection Issues

1. **API Server**: Ensure API server is running on port 3001
2. **CORS**: Check for CORS issues in browser console
3. **Network Access**: Verify network connectivity

### Performance

- **Update Intervals**: Adjust simulation intervals for performance
- **Point Count**: Large numbers of points may affect performance
- **Network Traffic**: Monitor BACnet network traffic

## Development

### Project Structure

```
├── server/
│   └── bacnet-server.js    # BACnet protocol server
├── src/
│   ├── components/         # React components
│   ├── context/           # State management
│   ├── services/          # API communication
│   └── common/            # Shared utilities
└── package.json
```

### API Endpoints

- `GET /api/device` - Get device information
- `POST /api/device` - Update device configuration
- `GET /api/points` - Get all points
- `POST /api/points/analog` - Add analog input
- `POST /api/points/binary` - Add binary input

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review BACnet protocol documentation
- Open an issue on GitHub