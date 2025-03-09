// Jest setup file
global.window = {
  electronAPI: {
    getNetworkInterfaces: jest.fn(),
    checkInterfaceStatus: jest.fn(),
    startDhcpDetection: jest.fn(),
    getDhcpAddress: jest.fn(),
    saveDetectionResult: jest.fn(),
    getDetectionHistory: jest.fn(),
    deleteHistoryItem: jest.fn(),
    clearDetectionHistory: jest.fn(),
  }
};

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 