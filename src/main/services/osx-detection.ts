import * as pcap from 'pcap';
import { getManufacturer } from './get-manufacture';
import * as sudo from 'sudo-prompt';
/**
 * macOS上的DHCP检测实现
 * @param interfaceName 网络接口名称
 * @param ownMacAddress 可选，本机MAC地址，用于过滤掉自己发出的DHCP请求
 */
export async function detectOnMacOS(interfaceName: string, ownMacAddress?: string): Promise<any> {
    console.log(`在macOS上执行DHCP检测，接口: ${interfaceName}`);
    if (ownMacAddress) {
      console.log(`已设置过滤本机MAC地址: ${ownMacAddress}`);
    }
  
    // 尝试为BPF设备授权
    try {
      const options = {
        name: 'IPMI DHCP Detector'
      };
      
      await new Promise<void>((resolve) => {
        sudo.exec(`chmod 777 /dev/bpf*`, options, function(error, stdout) {
          if (error) {
            console.error('无法设置BPF设备权限:', error);
            // 即使失败也继续尝试
          } 
          else {
            console.log('已设置BPF设备权限:', stdout);
          }
          resolve();
        });
      });
    } catch (err) {
      console.error('设置BPF权限过程中出错:', err);
      // 继续尝试
    }
    
    return new Promise((resolve, reject) => {
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
            resolve({
              success: false,
              error: '检测超时，未捕获到DHCP请求',
              macAddress: null,
              manufacturer: null
            });
          }
        }, 180000); // 3分钟超时
        
        pcapSession.on('packet', (rawPacket: Buffer) => {
          // 解析数据包
          const packet = pcap.decode.packet(rawPacket);
          console.log('捕获数据包:', JSON.stringify(packet, null, 2));
          
          try {
            // 适配实际的数据包结构
            if (packet.payload && packet.payload.shost) {
              // 直接从payload中获取以太网信息
              const ethernetInfo = {
                shost: packet.payload.shost,
                dhost: packet.payload.dhost,
                ethertype: packet.payload.ethertype
              };
              
              // 添加调试信息
              console.log('以太网帧信息:', {
                sourceMAC: ethernetInfo.shost.toString(),
                destMAC: ethernetInfo.dhost.toString(),
                etherType: ethernetInfo.ethertype
              });

              // 更新DHCP包检测逻辑以匹配实际结构
              // 检查UDP层的端口
              const udpLayer = packet.payload.payload?.payload;
              if (udpLayer && (udpLayer.dport === 67 || udpLayer.dport === 68 || 
                               udpLayer.sport === 67 || udpLayer.sport === 68)) {
                
                const macAddress = ethernetInfo.shost.toString().toUpperCase();
                console.log('发现DHCP数据包，MAC地址:', macAddress);
                
                // 过滤掉自己的MAC地址
                if (ownMacAddress && macAddress.toLowerCase() === ownMacAddress.toLowerCase()) {
                  console.log('忽略来自本机的DHCP数据包');
                  return;
                }
                
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
            } else if (packet.link && packet.link.ethernet) {
              // 保留原来的逻辑作为备选
              const ethernetInfo = packet.link.ethernet;
              
              // 添加调试信息
              console.log('以太网帧信息(旧结构):', {
                sourceMAC: ethernetInfo.shost.toString(),
                destMAC: ethernetInfo.dhost.toString(),
                etherType: ethernetInfo.ethertype
              });

              // 检查是否是DHCP包
              if (packet.payload && packet.payload.payload && 
                  (packet.payload.payload.dport === 67 || packet.payload.payload.dport === 68)) {
                
                const macAddress = ethernetInfo.shost.toString().toUpperCase();
                console.log('发现DHCP数据包，MAC地址:', macAddress);
                
                // 过滤掉自己的MAC地址
                if (ownMacAddress && macAddress.toLowerCase() === ownMacAddress.toLowerCase()) {
                  console.log('忽略来自本机的DHCP数据包');
                  return;
                }
                
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
        
        // 提供更有用的错误信息和建议
        let errorMessage = '无法创建网络捕获会话';
        if (error instanceof Error) {
          if (error.message.includes("monitor mode")) {
            errorMessage = '所选网络接口不支持监控模式，但已禁用监控模式，可能是其他原因导致失败';
          } else if (error.message.includes("Permission denied")) {
            errorMessage = '权限不足，无法访问网络设备，请尝试重新获取管理员权限';
          } else {
            errorMessage = `创建网络捕获会话失败: ${error.message}`;
          }
        }
        
        resolve({
          success: false,
          error: errorMessage,
          macAddress: null,
          manufacturer: null
        });
      }
    });
  }
  
  
  