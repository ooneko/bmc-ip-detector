import { ipcMain, dialog } from 'electron';
import * as si from 'systeminformation';
import * as network from 'network';
import * as os from 'os';
import { rootPermissionGranted } from '../main';
import { checkRootPermission, requestRootPermission, installPcapDependency } from '../utils/permission-utils';
import { detectOnMacOS } from '../services/osx-detection';
import { detectOnWindows } from '../services/windows-detection';
import { detectOnLinux } from '../services/linux-detection';
import { requestDhcpAddress } from '../services/dhcp-client';

// 获取所有网络接口
ipcMain.handle('get-network-interfaces', async () => {
  try {
    const interfaces = await si.networkInterfaces();
    console.log('获取到的所有网络接口:', interfaces);
    
    // 针对macOS（特别是Apple芯片）过滤网络接口
    // 只保留已连接的有线网卡（以太网卡）
    const filteredInterfaces = interfaces.filter((iface: si.NetworkInterfacesData) => {
      // 判断是否为有线网卡
      const isEthernet = 
        // 检查类型是否为有线
        (iface.type && iface.type.toLowerCase() === 'wired') || 
        // 检查名称是否以常见有线网卡前缀开头
        (iface.ifaceName && (
          iface.ifaceName.startsWith('eth') || 
          (iface.ifaceName.startsWith('en') && !iface.ifaceName.includes('wlan'))
        ));
      
      // 判断是否已连接（插了网线）
      const isConnected = iface.operstate && iface.operstate.toLowerCase() === 'up';
      
      // 必须是非内部、有线且已连接的接口
      const isValidInterface = !iface.internal && isEthernet && isConnected;
      
      // 增加调试日志
      console.log(`接口 ${iface.ifaceName || iface.iface}: 类型=${iface.type}, 状态=${iface.operstate}, 是有线=${isEthernet}, 已连接=${isConnected}, 是否有效=${isValidInterface}`);
      
      return isValidInterface;
    });
    
    console.log('已过滤的有线网卡:', filteredInterfaces);
    return filteredInterfaces;
  } catch (error) {
    console.error('获取网络接口失败:', error);
    return [];
  }
});

// 检查网络接口状态
ipcMain.handle('check-interface-status', async (_, interfaceName: string) => {
  console.log('检查接口状态:', interfaceName);
  
  try {
    // 首先使用systeminformation获取当前网络接口状态
    const allInterfaces = await si.networkInterfaces();
    console.log('所有网络接口:', allInterfaces);
    
    // 查找指定的接口
    const targetInterface = allInterfaces.find(iface => 
      iface.ifaceName === interfaceName || iface.iface === interfaceName
    );
    
    console.log('目标接口:', targetInterface);
    
    // 如果找到接口并且状态为活跃
    if (targetInterface && targetInterface.operstate === 'up') {
      return { connected: true, info: targetInterface };
    }
    
    // 使用network库作为备选
    return new Promise((resolve) => {
      network.get_active_interface((err: Error, info: any) => {
        if (err) {
          console.error('获取活动接口失败:', err);
          resolve({ connected: false, info: null });
          return;
        }
        
        console.log('活动网络接口信息:', info);
        
        // 在macOS上，网络接口名称可能不同
        const isMatchingInterface = 
          info && (info.name === interfaceName || 
                   (interfaceName.startsWith('en') && info.name.startsWith('en')) ||
                   (interfaceName.startsWith('eth') && info.name.startsWith('eth')));
                   
        if (isMatchingInterface) {
          resolve({ connected: true, info });
        } else {
          resolve({ connected: false, info: null });
        }
      });
    });
  } catch (error) {
    console.error('检查接口状态失败:', error);
    return { connected: false, info: null, error: (error as Error).message };
  }
});

// 执行DHCP检测
ipcMain.handle('start-dhcp-detection', async (_, interfaceName: string) => {
  console.log('开始DHCP检测，接口:', interfaceName);
  
  try {
    // 检查是否有管理员权限
    let rootPermissionState = rootPermissionGranted;  // 从主进程获取当前权限状态

    if (!rootPermissionState) {
      console.log('未获得管理员权限，尝试请求权限');
      rootPermissionState = await requestRootPermission();
      console.log('请求权限结果:', rootPermissionState);
      
      if (!rootPermissionState) {
        return {
          success: false,
          error: '无法获取管理员权限，无法进行DHCP检测。请尝试以管理员身份重新运行应用程序。',
          macAddress: null,
          manufacturer: null
        };
      } else {
        console.log('已获取管理员权限');
        rootPermissionState = true;
      }
    }
    
    // 获取本机MAC地址信息
    let ownMacAddress: string | undefined = undefined;
    try {
      const interfaces = await si.networkInterfaces();
      const targetInterface = interfaces.find(iface => 
        iface.ifaceName === interfaceName || iface.iface === interfaceName
      );
      
      if (targetInterface && targetInterface.mac) {
        ownMacAddress = targetInterface.mac.toLowerCase();
        console.log(`检测到本机接口 ${interfaceName} 的MAC地址: ${ownMacAddress}`);
      } else {
        console.log(`未能获取接口 ${interfaceName} 的MAC地址`);
      }
    } catch (error) {
      console.error('获取MAC地址失败:', error);
    }
    
    // 检查操作系统类型
    const platform = os.platform();
    console.log('操作系统:', platform);
    
    // 为不同操作系统实现不同的检测方法
    if (platform === 'darwin') {
      // macOS实现，传入本机MAC地址
      return await detectOnMacOS(interfaceName, ownMacAddress);
    } else if (platform === 'win32') {
      // Windows实现
      return await detectOnWindows(interfaceName);
    } else {
      // Linux/其他系统实现
      return await detectOnLinux(interfaceName);
    }
  } catch (error) {
    console.error('DHCP检测失败:', error);
    return { 
      success: false, 
      error: (error as Error).message || '未知错误',
      macAddress: null,
      manufacturer: null
    };
  }
});

// 获取DHCP地址信息
ipcMain.handle('get-dhcp-address', async (_, interfaceName: string, serverMac: string) => {
  console.log('获取DHCP地址信息，网卡:', interfaceName, '服务器MAC:', serverMac);
  
  try {
    // 导入全局权限状态
    let rootPermissionState = rootPermissionGranted;
    
    // 检查是否已获取root权限
    if (!rootPermissionState) {
      const hasPermission = await checkRootPermission();
      if (!hasPermission) {
        console.log('需要管理员权限来执行DHCP操作');
        
        // 显示权限请求对话框
        const { response } = await dialog.showMessageBox({
          type: 'info',
          title: '权限请求',
          message: '执行DHCP操作需要管理员权限',
          detail: '应用程序需要管理员权限才能执行DHCP操作。请在接下来的权限请求窗口中授予权限。',
          buttons: ['确定', '取消'],
          defaultId: 0,
          cancelId: 1
        });
        
        if (response === 1) {
          return {
            success: false,
            error: '用户拒绝授予管理员权限'
          };
        }
        
        // 请求管理员权限
        const granted = await requestRootPermission();
        rootPermissionState = granted;
        
        if (!granted) {
          return {
            success: false,
            error: '无法获取管理员权限'
          };
        }
      } else {
        rootPermissionState = true;
      }
    }
    
    // 确保MAC地址格式正确（全部小写，冒号分隔）
    const formattedMac = serverMac.toLowerCase().replace(/[^a-f0-9]/g, '').replace(/(.{2})(?=.)/g, '$1:');
    console.log('格式化后的MAC地址:', formattedMac);
    
    // 使用DHCP客户端发送请求并获取地址分配
    try {
      const result = await requestDhcpAddress(interfaceName, formattedMac);
      return result;
    } catch (dhcpError) {
      console.error('DHCP请求过程中出错:', dhcpError);
      return {
        success: false,
        error: dhcpError instanceof Error ? dhcpError.message : '发送DHCP请求失败',
      };
    }
  } catch (error) {
    console.error('获取DHCP地址失败:', error);
    return { 
      success: false, 
      error: (error as Error).message || '未知错误'
    };
  }
}); 