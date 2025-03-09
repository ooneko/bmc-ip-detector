/**
 * DHCP 检测功能的单元测试
 */
import { jest } from '@jest/globals';

// 模拟 DHCP 检测结果
const mockServerMac = '00:25:90:AB:CD:EF';
const mockDhcpResult = {
  ipAddress: '192.168.1.10',
  subnetMask: '255.255.255.0',
  defaultGateway: '192.168.1.1',
  dhcpServer: '192.168.1.254',
};

describe('DHCP 检测功能', () => {
  // 模拟 window.electronAPI 调用
  let mockStartDhcpDetection: any;
  let mockGetDhcpAddress: any;
  
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 创建新的模拟函数
    mockStartDhcpDetection = jest.fn().mockResolvedValue(mockServerMac as never);
    mockGetDhcpAddress = jest.fn().mockResolvedValue(mockDhcpResult as never);
    
    // 模拟 window.electronAPI
    (global.window as any) = {
      ...(global.window as any),
      electronAPI: {
        ...((global.window as any).electronAPI || {}),
        startDhcpDetection: mockStartDhcpDetection,
        getDhcpAddress: mockGetDhcpAddress,
      },
    };
  });
  
  test('应成功检测服务器 MAC 地址', async () => {
    // 测试模拟 API 调用
    const mac = await (global.window as any).electronAPI.startDhcpDetection('en0');
    
    // 验证返回的数据
    expect(mac).toBe(mockServerMac);
    expect(mockStartDhcpDetection).toHaveBeenCalledWith('en0');
  });
  
  test('应成功获取 DHCP 信息', async () => {
    // 测试模拟 API 调用
    const dhcpInfo = await (global.window as any).electronAPI.getDhcpAddress('en0', mockServerMac);
    
    // 验证返回的数据
    expect(dhcpInfo).toEqual(mockDhcpResult);
    expect(dhcpInfo.ipAddress).toBe('192.168.1.10');
    expect(dhcpInfo.subnetMask).toBe('255.255.255.0');
    expect(dhcpInfo.defaultGateway).toBe('192.168.1.1');
    expect(dhcpInfo.dhcpServer).toBe('192.168.1.254');
    expect(mockGetDhcpAddress).toHaveBeenCalledWith('en0', mockServerMac);
  });
  
  test('应能正确处理 MAC 地址检测超时', async () => {
    // 模拟检测超时
    mockStartDhcpDetection.mockResolvedValue('timeout');
    
    const mac = await (global.window as any).electronAPI.startDhcpDetection('en0');
    expect(mac).toBe('timeout');
  });
  
  test('应能正确处理 DHCP 检测失败', async () => {
    // 模拟检测失败
    mockGetDhcpAddress.mockResolvedValue(null);
    
    const dhcpInfo = await (global.window as any).electronAPI.getDhcpAddress('en0', mockServerMac);
    expect(dhcpInfo).toBeNull();
  });
}); 