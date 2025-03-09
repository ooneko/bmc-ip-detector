// 定义网络接口类型
export interface NetworkInterface {
  iface: string;
  ifaceName?: string;  // 添加ifaceName属性
  name: string;
  mac: string;
  type: string;
  operstate: string;
  ip4?: string;
}

// 定义检测步骤类型
export type DetectionStep = 1 | 2 | 3;

// 定义DHCP结果类型
export interface DHCPResult {
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dhcpServer: string;
} 