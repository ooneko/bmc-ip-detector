import { contextBridge, ipcRenderer } from 'electron';

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 网络接口相关
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  checkInterfaceStatus: (interfaceName: string) => ipcRenderer.invoke('check-interface-status', interfaceName),
  
  // DHCP检测相关
  startDhcpDetection: (interfaceName: string) => ipcRenderer.invoke('start-dhcp-detection', interfaceName),
  getDhcpAddress: (interfaceName: string, serverMac: string) => ipcRenderer.invoke('get-dhcp-address', interfaceName, serverMac),
  
  // 历史记录相关
  saveDetectionResult: (data: any) => ipcRenderer.invoke('save-detection-result', data),
  getDetectionHistory: () => ipcRenderer.invoke('get-detection-history'),
  deleteHistoryItem: (id: string) => ipcRenderer.invoke('delete-history-item', id),
  clearDetectionHistory: () => ipcRenderer.invoke('clear-detection-history'),
}); 