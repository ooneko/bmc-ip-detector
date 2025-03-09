import React from 'react';
import { NetworkInterface } from '../../types';

interface InterfaceSelectionProps {
  networkInterfaces: NetworkInterface[];
  selectedInterface: string;
  setSelectedInterface: (value: string) => void;
  checkInterfaceStatus: () => void;
  fetchNetworkInterfaces: () => void;
  isLoading: boolean;
  isImageEnlarged: boolean;
  setIsImageEnlarged: (value: boolean) => void;
}

const InterfaceSelection: React.FC<InterfaceSelectionProps> = ({
  networkInterfaces,
  selectedInterface,
  setSelectedInterface,
  checkInterfaceStatus,
  fetchNetworkInterfaces,
  isLoading,
  isImageEnlarged,
  setIsImageEnlarged
}) => {
  return (
    <div className="step-content interface-selection">
      <h3>连接服务器并选择网络设备</h3>
      <p className="hint">请按照以下步骤操作：</p>
      
      <div className="connection-guide">
        <div className="guide-steps">
          <ol>
            <li>确保服务器已开机</li>
            <li>使用网线连接服务器的IPMI网口</li>
            <li>将网线另一端连接到您的电脑</li>
            <li>选择电脑对应的网络接口</li>
            <li>点击"检测连接"按钮</li>
          </ol>
        </div>
        <div className="connection-image">
          <img 
            src="assets/images/ipmi-connection.png" 
            alt="IPMI连接示意图" 
            className={isImageEnlarged ? "enlarged" : "thumbnail"}
            onClick={() => setIsImageEnlarged(!isImageEnlarged)}
            title={isImageEnlarged ? "点击缩小" : "点击放大"}
          />
        </div>
      </div>
      
      <div className="interface-selector">
        <select 
          value={selectedInterface} 
          onChange={(e) => setSelectedInterface(e.target.value)}
          disabled={isLoading}
        >
          <option value="">-- 请选择网络接口 --</option>
          {networkInterfaces.map((iface) => (
            <option key={iface.iface || iface.ifaceName} value={iface.iface || iface.ifaceName}>
              {iface.ifaceName || iface.iface} - {iface.mac} {iface.ip4 ? `(${iface.ip4})` : ''}
            </option>
          ))}
        </select>
        
        <button 
          className="refresh-button" 
          onClick={fetchNetworkInterfaces} 
          disabled={isLoading}
          title="刷新网络接口列表"
        >
          <i className="fas fa-sync-alt"></i> 刷新
        </button>
      </div>
      
      <div className="action-buttons">
        <button 
          className="next-button" 
          onClick={checkInterfaceStatus} 
          disabled={!selectedInterface || isLoading}
        >
          {isLoading ? <span><i className="fas fa-spinner fa-spin"></i> 处理中...</span> : '检测连接'}
        </button>
      </div>
    </div>
  );
};

export default InterfaceSelection; 