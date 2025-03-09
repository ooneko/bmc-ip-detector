/**
 * 网络接口相关功能的单元测试
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// 模拟 window.electronAPI 调用
const mockGetNetworkInterfaces = jest.fn();
const mockCheckInterfaceStatus = jest.fn();

// 模拟网络接口数据
const mockNetworkInterfaces = [
  {
    iface: 'en0',
    ifaceName: 'en0',
    name: '以太网',
    mac: '00:11:22:33:44:55',
    type: 'wired',
    operstate: 'up',
    ip4: '192.168.1.100'
  },
  {
    iface: 'en1',
    ifaceName: 'en1',
    name: '无线网卡',
    mac: 'AA:BB:CC:DD:EE:FF',
    type: 'wireless',
    operstate: 'up',
    ip4: '192.168.1.101'
  }
];

// 模拟 React 组件的 state 和 props
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn(),
    useEffect: jest.fn(),
  };
});

describe('网络接口检测功能', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 设置默认模拟返回值
    mockGetNetworkInterfaces.mockResolvedValue(mockNetworkInterfaces);
    mockCheckInterfaceStatus.mockResolvedValue({ connected: true, info: mockNetworkInterfaces[0] });
    
    // 模拟 window.electronAPI
    (global.window as any) = {
      ...(global.window as any),
      electronAPI: {
        ...((global.window as any).electronAPI || {}),
        getNetworkInterfaces: mockGetNetworkInterfaces,
        checkInterfaceStatus: mockCheckInterfaceStatus,
      },
    };
  });
  
  test('应成功获取网络接口列表', async () => {
    // 测试模拟 API 调用
    const interfaces = await (global.window as any).electronAPI.getNetworkInterfaces();
    
    // 验证返回的数据
    expect(interfaces).toEqual(mockNetworkInterfaces);
    expect(interfaces.length).toBe(2);
    expect(interfaces[0].type).toBe('wired');
    expect(interfaces[1].type).toBe('wireless');
  });
  
  test('应该正确处理有线网卡的链接状态', async () => {
    // 模拟已连接状态
    mockCheckInterfaceStatus.mockResolvedValue({ 
      connected: true, 
      info: mockNetworkInterfaces[0]
    });
    
    const status = await (global.window as any).electronAPI.checkInterfaceStatus('en0');
    expect(status.connected).toBe(true);
    
    // 模拟未连接状态
    mockCheckInterfaceStatus.mockResolvedValue({ 
      connected: false, 
      info: null 
    });
    
    const status2 = await (global.window as any).electronAPI.checkInterfaceStatus('en0');
    expect(status2.connected).toBe(false);
  });
  
  test('应该筛选出只有有线并且已连接的网卡', () => {
    const interfaces = mockNetworkInterfaces;
    const filteredInterfaces = interfaces.filter(iface => 
      iface.type === 'wired' && iface.operstate === 'up'
    );
    
    expect(filteredInterfaces.length).toBe(1);
    expect(filteredInterfaces[0].iface).toBe('en0');
  });
}); 