declare module 'network';
declare module 'network-address';

// 为electron-store添加类型声明
declare module 'electron-store' {
  class Store<T> {
    constructor(options?: any);
    get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K];
    get(key: string, defaultValue?: any): any;
    set<K extends keyof T>(key: K, value: T[K]): void;
    set(key: string, value: any): void;
    has<K extends keyof T>(key: K): boolean;
    has(key: string): boolean;
    delete<K extends keyof T>(key: K): void;
    delete(key: string): void;
    clear(): void;
    size: number;
    store: T;
    path: string;
  }
  export default Store;
}

// 为systeminformation添加类型声明
declare module 'systeminformation' {
  export interface NetworkInterfacesData {
    iface: string;
    ifaceName: string;
    ip4: string;
    ip6: string;
    mac: string;
    internal: boolean;
    virtual: boolean;
    operstate: string;
    type: string;
    duplex: string;
    mtu: number;
    speed: number;
    dhcp: boolean;
    dnsSuffix: string;
    ieee8021xAuth: string;
    ieee8021xState: string;
    carrierChanges: number;
  }

  export function networkInterfaces(): Promise<NetworkInterfacesData[]>;
}

// 为window.electronAPI添加类型声明
interface ElectronAPI {
  getNetworkInterfaces: () => Promise<systeminformation.NetworkInterfacesData[]>;
  checkInterfaceStatus: (interfaceName: string) => Promise<string>;
  startDhcpDetection: (interfaceName: string) => Promise<string>;
  getDhcpAddress: (interfaceName: string, serverMac: string) => Promise<any>;
  saveDetectionResult: (data: any) => Promise<void>;
  getDetectionHistory: () => Promise<any[]>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearDetectionHistory: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 