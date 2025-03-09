import * as os from 'os';

interface NetworkInterface {
  name: string;
  mac: string;
  address: string;
  family: string;
  internal: boolean;
}

function getNetworkInterfaces(): NetworkInterface[] {
  const interfaces = os.networkInterfaces();
  const result: NetworkInterface[] = [];

  for (const [name, details] of Object.entries(interfaces)) {
    if (!details) continue;

    for (const detail of details) {
      // 过滤掉内部接口和IPv6地址
      if (!detail.internal && detail.family === 'IPv4') {
        result.push({
          name,
          mac: detail.mac,
          address: detail.address,
          family: detail.family,
          internal: detail.internal,
        });
      }
    }
  }

  return result;
}

// 使用示例
const networkInterfaces = getNetworkInterfaces();
console.log('本地网卡信息:');
networkInterfaces.forEach((iface) => {
  console.log(`名称: ${iface.name}`);
  console.log(`MAC地址: ${iface.mac}`);
  console.log(`IP地址: ${iface.address}`);
  console.log('-------------------');
});