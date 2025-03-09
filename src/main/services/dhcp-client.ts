import * as pcap from 'pcap';
import * as os from 'os';
import * as dgram from 'dgram';
import * as crypto from 'crypto';

/**
 * DHCP消息类型
 */
const DHCP_MESSAGE_TYPE = {
  DISCOVER: 1,  // 客户端寻找DHCP服务器
  OFFER: 2,     // 服务器响应发现请求
  REQUEST: 3,   // 客户端请求IP地址
  ACK: 5,       // 服务器确认分配IP地址
  NAK: 6        // 服务器拒绝请求
};

/**
 * 构建DHCP请求数据包
 * 
 * @param {string} macAddress 被模拟设备的MAC地址
 * @param {number} messageType DHCP消息类型
 * @param {string} requestedIp 可选，请求的IP地址
 * @param {string} serverIdentifier 可选，DHCP服务器标识
 * @returns {Buffer} DHCP请求数据包
 */
function buildDhcpPacket(macAddress: string, messageType: number, requestedIp?: string, serverIdentifier?: string): Buffer {
  // 转换MAC地址为字节数组
  const macBytes = macAddress.split(':').map(hexPair => parseInt(hexPair, 16));
  
  // 生成随机事务ID
  const xid = crypto.randomBytes(4);
  
  // 创建DHCP数据包
  const packet = Buffer.alloc(548, 0); // 标准DHCP数据包大小
  
  // BOOTP头
  packet[0] = 1;  // OP: 1 = BOOTREQUEST
  packet[1] = 1;  // HTYPE: 1 = 以太网
  packet[2] = 6;  // HLEN: 6 = MAC地址长度
  packet[3] = 0;  // HOPS
  
  // 事务ID (XID)
  xid.copy(packet, 4);
  
  // SECS: 请求时长
  packet[8] = 0;
  packet[9] = 0;
  
  // FLAGS: 0x0000 = 单播
  packet[10] = 0;
  packet[11] = 0;
  
  // CIADDR, YIADDR, SIADDR, GIADDR: 全部为0
  // 这些地址在DISCOVER阶段应为0
  
  // CHADDR: 客户端硬件地址（MAC）
  for (let i = 0; i < 6; i++) {
    packet[28 + i] = macBytes[i];
  }
  
  // DHCP Magic Cookie: 标识DHCP包
  packet[236] = 99;
  packet[237] = 130;
  packet[238] = 83;
  packet[239] = 99;
  
  // DHCP选项
  let optionIndex = 240;
  
  // 选项53: DHCP消息类型
  packet[optionIndex++] = 53;  // 选项代码
  packet[optionIndex++] = 1;   // 长度
  packet[optionIndex++] = messageType;  // 值
  
  // 如果是REQUEST消息且有请求的IP
  if (messageType === DHCP_MESSAGE_TYPE.REQUEST && requestedIp) {
    // 选项50: 请求的IP地址
    packet[optionIndex++] = 50;  // 选项代码
    packet[optionIndex++] = 4;   // 长度
    const ipParts = requestedIp.split('.').map(p => parseInt(p, 10));
    packet[optionIndex++] = ipParts[0];
    packet[optionIndex++] = ipParts[1];
    packet[optionIndex++] = ipParts[2];
    packet[optionIndex++] = ipParts[3];
    
    // 选项54: 服务器标识（如果有）
    if (serverIdentifier) {
      packet[optionIndex++] = 54;  // 选项代码
      packet[optionIndex++] = 4;   // 长度
      const serverIdParts = serverIdentifier.split('.').map(p => parseInt(p, 10));
      packet[optionIndex++] = serverIdParts[0];
      packet[optionIndex++] = serverIdParts[1];
      packet[optionIndex++] = serverIdParts[2];
      packet[optionIndex++] = serverIdParts[3];
    }
  }
  
  // 选项55: 参数请求列表
  packet[optionIndex++] = 55;  // 选项代码
  packet[optionIndex++] = 4;   // 长度
  packet[optionIndex++] = 1;   // 子网掩码
  packet[optionIndex++] = 3;   // 路由器
  packet[optionIndex++] = 6;   // DNS服务器
  packet[optionIndex++] = 15;  // 域名
  
  // 选项12: 主机名
  const hostname = "ipmi-server-probe";
  packet[optionIndex++] = 12;  // 选项代码
  packet[optionIndex++] = hostname.length;  // 长度
  for (let i = 0; i < hostname.length; i++) {
    packet[optionIndex++] = hostname.charCodeAt(i);
  }
  
  // 选项60: 供应商类标识符
  const vendorId = "IPMI-DHCP-DETECTOR";
  packet[optionIndex++] = 60;  // 选项代码
  packet[optionIndex++] = vendorId.length;  // 长度
  for (let i = 0; i < vendorId.length; i++) {
    packet[optionIndex++] = vendorId.charCodeAt(i);
  }
  
  // 选项61: 客户端标识符
  packet[optionIndex++] = 61;  // 选项代码
  packet[optionIndex++] = 7;   // 长度
  packet[optionIndex++] = 1;   // 硬件类型 (1=以太网)
  for (let i = 0; i < 6; i++) {
    packet[optionIndex++] = macBytes[i];
  }
  
  // 选项255: 结束
  packet[optionIndex++] = 255;
  
  return packet;
}

/**
 * 解析DHCP服务器响应
 * 
 * @param {Buffer} packet DHCP数据包
 * @returns {Object|null} 解析后的DHCP信息或null
 */
function parseDhcpResponse(packet: any): any | null {
  try {
    // 检查是否是UDP包
    if (!packet.payload || !packet.payload.payload || !packet.payload.payload.data) {
      return null;
    }
    
    const dhcpData = packet.payload.payload.data;
    
    // 检查DHCP magic cookie (99, 130, 83, 99)
    if (dhcpData[236] !== 99 || dhcpData[237] !== 130 || dhcpData[238] !== 83 || dhcpData[239] !== 99) {
      return null;
    }
    
    // 解析分配的IP地址 (YIADDR)
    const ipAddress = `${dhcpData[16]}.${dhcpData[17]}.${dhcpData[18]}.${dhcpData[19]}`;
    
    // 解析DHCP服务器地址 (SIADDR)
    const dhcpServer = `${dhcpData[20]}.${dhcpData[21]}.${dhcpData[22]}.${dhcpData[23]}`;
    
    // 解析选项
    let optionsIndex = 240;
    let subnetMask = '';
    let router = '';
    let messageType = 0;
    
    while (optionsIndex < dhcpData.length) {
      const optionCode = dhcpData[optionsIndex++];
      
      // 结束选项
      if (optionCode === 255) {
        break;
      }
      
      // Pad选项
      if (optionCode === 0) {
        continue;
      }
      
      const optionLength = dhcpData[optionsIndex++];
      
      // 解析选项
      switch (optionCode) {
        case 1: // 子网掩码
          subnetMask = `${dhcpData[optionsIndex]}.${dhcpData[optionsIndex+1]}.${dhcpData[optionsIndex+2]}.${dhcpData[optionsIndex+3]}`;
          break;
        case 3: // 路由器
          router = `${dhcpData[optionsIndex]}.${dhcpData[optionsIndex+1]}.${dhcpData[optionsIndex+2]}.${dhcpData[optionsIndex+3]}`;
          break;
        case 53: // DHCP消息类型
          messageType = dhcpData[optionsIndex];
          break;
      }
      
      optionsIndex += optionLength;
    }
    
    // 仅处理OFFER和ACK消息
    if (messageType !== DHCP_MESSAGE_TYPE.OFFER && messageType !== DHCP_MESSAGE_TYPE.ACK) {
      return null;
    }
    
    return {
      messageType,
      ipAddress,
      subnetMask,
      defaultGateway: router,
      dhcpServer
    };
  } catch (error) {
    console.error('解析DHCP响应失败:', error);
    return null;
  }
}

/**
 * 使用服务器MAC地址发送DHCP请求并获取IP地址分配
 * 
 * @param {string} interfaceName 网络接口名称
 * @param {string} serverMac 服务器MAC地址
 * @returns {Promise<Object>} DHCP地址分配结果
 */
export async function requestDhcpAddress(interfaceName: string, serverMac: string): Promise<any> {
  console.log(`使用服务器MAC地址 ${serverMac} 开始DHCP请求过程`);
  
  return new Promise((resolve, reject) => {
    try {
      // 创建DHCP DISCOVER数据包
      const discoverPacket = buildDhcpPacket(
        serverMac, 
        DHCP_MESSAGE_TYPE.DISCOVER
      );
      
      // 创建UDP套接字
      const client = dgram.createSocket('udp4');
      
      // 监听DHCP响应
      let pcapSession: any;
      let requestSent = false;
      let offerReceived = false;
      let timeoutId: NodeJS.Timeout;
      
      try {
        // 创建pcap会话监听DHCP响应
        pcapSession = pcap.createSession(interfaceName, {
          filter: 'udp port 67 or udp port 68', // DHCP流量过滤器
        });
        
        console.log('创建pcap会话成功，准备监听DHCP响应');
        
        // 设置总超时
        timeoutId = setTimeout(() => {
          console.log('DHCP请求超时');
          client.close();
          if (pcapSession) pcapSession.close();
          
          resolve({
            success: false,
            error: 'DHCP请求超时，未收到服务器响应',
          });
        }, 30000); // 30秒超时
        
        pcapSession.on('packet', (rawPacket: Buffer) => {
          // 解析数据包
          const packet = pcap.decode.packet(rawPacket);
          
          // 处理DHCP响应
          const dhcpResponse = parseDhcpResponse(packet);
          if (!dhcpResponse) {
            return;
          }
          
          console.log('收到DHCP响应:', dhcpResponse);
          
          if (dhcpResponse.messageType === DHCP_MESSAGE_TYPE.OFFER && !offerReceived) {
            offerReceived = true;
            console.log('收到DHCP OFFER，准备发送REQUEST');
            
            // 发送DHCP REQUEST
            const requestPacket = buildDhcpPacket(
              serverMac, 
              DHCP_MESSAGE_TYPE.REQUEST, 
              dhcpResponse.ipAddress, 
              dhcpResponse.dhcpServer
            );
            
            // 广播DHCP REQUEST
            client.send(
              requestPacket, 
              0, 
              requestPacket.length, 
              68, 
              '255.255.255.255', 
              (err) => {
                if (err) {
                  console.error('发送DHCP REQUEST失败:', err);
                } else {
                  console.log('已发送DHCP REQUEST');
                  requestSent = true;
                }
              }
            );
          } 
          else if (dhcpResponse.messageType === DHCP_MESSAGE_TYPE.ACK && requestSent) {
            // 收到DHCP ACK，地址分配成功
            client.close();
            pcapSession.close();
            clearTimeout(timeoutId);
            
            console.log('收到DHCP ACK，地址分配成功');
            resolve({
              success: true,
              ipAddress: dhcpResponse.ipAddress,
              subnetMask: dhcpResponse.subnetMask,
              defaultGateway: dhcpResponse.defaultGateway,
              dhcpServer: dhcpResponse.dhcpServer,
              message: '已成功获取DHCP地址'
            });
          }
        });
        
      } catch (pcapError) {
        console.error('创建pcap会话失败:', pcapError);
        // 如果pcap失败，仍然尝试发送DHCP请求，但可能无法接收响应
      }
      
      // 设置套接字选项
      client.on('listening', () => {
        console.log('UDP客户端监听中');
        
        // 设置UDP广播
        client.setBroadcast(true);
        
        // 广播DHCP DISCOVER
        client.send(
          discoverPacket, 
          0, 
          discoverPacket.length, 
          67, 
          '255.255.255.255', 
          (err) => {
            if (err) {
              console.error('发送DHCP DISCOVER失败:', err);
              client.close();
              if (pcapSession) pcapSession.close();
              clearTimeout(timeoutId);
              reject(err);
            } else {
              console.log('已发送DHCP DISCOVER');
            }
          }
        );
      });
      
      client.on('error', (err) => {
        console.error('UDP客户端错误:', err);
        if (pcapSession) pcapSession.close();
        clearTimeout(timeoutId);
        reject(err);
      });
      
      // 开始监听
      client.bind({
        address: '0.0.0.0',
        port: 68
      });
    } catch (error) {
      console.error('DHCP请求过程中出错:', error);
      reject(error);
    }
  });
} 