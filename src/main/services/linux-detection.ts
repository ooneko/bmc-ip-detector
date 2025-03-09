import * as pcap from 'pcap';
import { exec } from 'child_process';
import { getManufacturer } from './get-manufacture';

/**
 * Linux上的检测实现
 */
export async function detectOnLinux(interfaceName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`在Linux上执行DHCP检测，接口: ${interfaceName}`);
      
      try {
        // 创建pcap会话
        const pcapSession = pcap.createSession(interfaceName, {
          filter: 'udp port 67 or udp port 68', // DHCP流量过滤器
        });
        
        console.log('创建pcap会话成功');
        
        let foundMac = false;
        let timeoutId: NodeJS.Timeout;
        
        // 设置超时
        timeoutId = setTimeout(() => {
          if (!foundMac) {
            pcapSession.close();
            console.log('DHCP检测超时');
            
            // 超时后尝试从系统日志获取DHCP信息
            exec('grep -i dhcp /var/log/syslog | tail -20', (error: Error | null, stdout: string) => {
              if (!error && stdout) {
                console.log('系统日志中的DHCP信息:', stdout);
                
                // 从日志中提取MAC地址
                const macPattern = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g;
                const matches = stdout.match(macPattern);
                
                if (matches && matches.length > 0) {
                  const macAddress = matches[0].toUpperCase();
                  console.log('从日志中发现MAC地址:', macAddress);
                  
                  getManufacturer(macAddress).then(manufacturer => {
                    console.log('MAC地址厂商:', manufacturer);
                    resolve({
                      success: true,
                      macAddress: macAddress,
                      manufacturer: manufacturer,
                      message: '已从系统日志中捕获服务器MAC地址'
                    });
                  });
                  return;
                }
              }
              
              resolve({
                success: false,
                error: '检测超时，未捕获到DHCP请求',
                macAddress: null,
                manufacturer: null
              });
            });
          }
        }, 180000); // 3分钟超时
        
        pcapSession.on('packet', (rawPacket: Buffer) => {
          // 解析数据包
          const packet = pcap.decode.packet(rawPacket);
          console.log('捕获数据包:', JSON.stringify(packet, null, 2));
          
          try {
            // 提取以太网帧信息
            if (packet.link && packet.link.ethernet) {
              const ethernetInfo = packet.link.ethernet;
              
              // 检查是否是DHCP包
              if (packet.payload && packet.payload.payload && 
                  (packet.payload.payload.dport === 67 || packet.payload.payload.dport === 68)) {
                
                const macAddress = ethernetInfo.shost.toString().toUpperCase();
                console.log('发现DHCP数据包，MAC地址:', macAddress);
                
                if (!foundMac) {
                  foundMac = true;
                  pcapSession.close();
                  clearTimeout(timeoutId);
                  
                  // 获取厂商信息
                  getManufacturer(macAddress).then(manufacturer => {
                    console.log('MAC地址厂商:', manufacturer);
                    resolve({
                      success: true,
                      macAddress: macAddress,
                      manufacturer: manufacturer,
                      message: '已成功通过DHCP捕获服务器MAC地址'
                    });
                  });
                }
              }
            }
          } catch (error) {
            console.error('解析数据包时出错:', error);
          }
        });
        
        pcapSession.on('error', (error: Error) => {
          console.error('pcap会话错误:', error);
          clearTimeout(timeoutId);
          reject(error);
        });
        
      } catch (error) {
        console.error('创建pcap会话失败:', error);
        reject(error);
      }
    });
  } 