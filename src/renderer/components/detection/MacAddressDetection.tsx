import React from 'react';

interface MacAddressDetectionProps {
  interfaceStatus: string;
  serverMac: string;
  manufacturer: string;
  isLoading: boolean;
  countdown: number;
  progress: number;
  detectServerMac: () => void;
  setCurrentStep: (step: number) => void;
  clearListenTimer: () => void;
}

const MacAddressDetection: React.FC<MacAddressDetectionProps> = ({
  interfaceStatus,
  serverMac,
  manufacturer,
  isLoading,
  countdown,
  progress,
  detectServerMac,
  setCurrentStep,
  clearListenTimer
}) => {
  return (
    <div className="panel active" id="panel2">
      <div className="panel-header">
        <h3><i className="fas fa-server"></i> 复制服务器MAC地址</h3>
      </div>
      <div className="panel-body">
        <div className="connection-guide">
          <div className="connection-status">
            <div className="status-badge" id="server-connection-status">
              <i className="fas fa-plug"></i>
              <span>{interfaceStatus}</span>
            </div>
          </div>
          <div className="guide-steps">
            <p>请按照以下步骤操作：</p>
            <ol>
              <li>保持服务器与电脑的连接</li>
              <li>系统正在自动监听DHCP广播包</li>
              <li>监听时间为3分钟，请耐心等待</li>
              <li>如需重新监听，可点击"重新监听"按钮</li>
            </ol>
          </div>
        </div>

        <div className="server-info-container">
          <div className="server-info-section">
            <h4>服务器连接信息</h4>
            <div className="info-item">
              <div className="info-label">连接状态：</div>
              <div className="info-value" id="server-connection-text">
                {isLoading ? '检测中...' : serverMac !== '--:--:--:--:--:--' ? '已接收到DHCP广播' : '等待DHCP广播'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">MAC地址：</div>
              <div className="info-value mac-address" id="server-mac">
                {serverMac}
              </div>
              <button 
                className="btn-copy" 
                title="复制到剪贴板"
                onClick={() => navigator.clipboard.writeText(serverMac)}
                disabled={serverMac === '--:--:--:--:--:--' || serverMac === '正在检测...' || serverMac === '未检测到' || serverMac === '检测失败' || serverMac === '未检测到（已超时）'}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <div className="info-item">
              <div className="info-label">制造商：</div>
              <div className="info-value" id="manufacturer">
                {manufacturer}
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="scan-animation" id="mac-scan-animation">
            <div className="scan-icon">
              <i className="fas fa-search"></i>
            </div>
            <div className="progress-bar">
              <div className="progress" id="mac-progress" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="scan-status" id="scan-status">
              正在监听DHCP广播包... 剩余时间: {Math.floor(countdown / 60)}分{countdown % 60}秒
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn primary" 
            onClick={detectServerMac}
            disabled={isLoading}
          >
            <i className="fas fa-broadcast-tower"></i> 重新监听
          </button>
          <button 
            className="btn secondary" 
            onClick={() => {
              clearListenTimer();
              setCurrentStep(1);
            }}
          >
            <i className="fas fa-arrow-left"></i> 上一步
          </button>
          <button 
            className="btn secondary" 
            onClick={() => setCurrentStep(3)}
            disabled={serverMac === '--:--:--:--:--:--' || isLoading || serverMac === '未检测到' || serverMac === '检测失败' || serverMac === '未检测到（已超时）'}
          >
            <i className="fas fa-arrow-right"></i> 下一步
          </button>
        </div>
      </div>
    </div>
  );
};

export default MacAddressDetection; 