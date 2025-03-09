/**
 * 根据MAC地址获取厂商信息
 */
export async function getManufacturer(macAddress: string): Promise<string> {
  try {
    // MAC地址前6位（OUI）用于识别厂商
    const oui = macAddress.replace(/:/g, '').substring(0, 6).toUpperCase();
    
    // 在实际应用中，可以使用API请求获取厂商信息
    // 这里使用一个简单的硬编码映射作为示例
    const manufacturers: Record<string, string> = {
      '001B44': 'Dell Inc.',
      '000C29': 'VMware, Inc.',
      '001018': 'Broadcom Limited',
      '001A4B': 'Hewlett Packard Enterprise',
      '002481': 'Hewlett-Packard Company',
      // 可以添加更多厂商映射
    };
    
    return manufacturers[oui] || '未知厂商';
  } catch (error) {
    console.error('获取厂商信息失败:', error);
    return '未知厂商';
  }
}
