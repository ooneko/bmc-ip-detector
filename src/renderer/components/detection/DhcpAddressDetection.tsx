import React from 'react';
import { DHCPResult } from '../../types';

interface DHCPAddressDetectionProps {
  serverMac: string;
  dhcpResult: DHCPResult | null;
  isLoading: boolean;
  detectDhcpAddress: () => void;
  saveResult: () => void;
  setCurrentStep: (step: number) => void;
}

const DHCPAddressDetection: React.FC<DHCPAddressDetectionProps> = ({
  serverMac,
  dhcpResult,
  isLoading,
  detectDhcpAddress,
  saveResult,
  setCurrentStep
}) => {
  return (
    <div className="panel active" id="panel3">
      <div className="panel-header">
        <h3><i className="fas fa-network-wired"></i> 连接交换机获取地址</h3>
      </div>
      <div className="panel-body">
        <div className="connection-guide">
          <div className="connection-status">
            <div className="status-badge" id="switch-connection-status">
              <i className="fas fa-ethernet"></i>
              <span>等待连接</span>
            </div>
          </div>
          <div className="guide-steps">
            <p>现在请按照以下步骤操作：</p>
            <ol>
              <li>断开服务器的网线连接</li>
              <li>使用网线连接交换机端口</li>
              <li>将网线另一端连接到您选择的网络接口</li>
              <li>系统将使用第二步获取的服务器MAC地址向DHCP服务器请求IP</li>
            </ol>
          </div>
        </div>

        <div className="mac-info-display">
          <h4>检测信息</h4>
          <div className="mac-info-row">
            <div className="mac-info-label">使用MAC地址：</div>
            <div className="mac-info-value" id="mac-for-dhcp">
              {serverMac}
            </div>
          </div>
          <div className="mac-info-row">
            <div className="mac-info-label">自动检测状态：</div>
            <div className="mac-info-value" id="dhcp-detect-status">
              {isLoading ? '正在获取DHCP地址...' : dhcpResult ? '已获取IP地址' : '等待网络连接...'}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="scan-animation" id="dhcp-scan-animation">
            <div className="scan-icon">
              <i className="fas fa-globe"></i>
            </div>
            <div className="progress-bar">
              <div className="progress" id="dhcp-progress" style={{ width: '50%' }}></div>
            </div>
            <div className="scan-status" id="dhcp-status">正在请求DHCP地址...</div>
          </div>
        )}

        {dhcpResult && (
          <div className="result-container" id="dhcp-result-container">
            <h4>DHCP获取结果</h4>
            <div className="result-table">
              <div className="result-row">
                <div className="result-label">IP地址：</div>
                <div className="result-value" id="ip-address">
                  {dhcpResult.ipAddress}
                </div>
              </div>
              <div className="result-row">
                <div className="result-label">子网掩码：</div>
                <div className="result-value" id="subnet-mask">
                  {dhcpResult.subnetMask}
                </div>
              </div>
              <div className="result-row">
                <div className="result-label">默认网关：</div>
                <div className="result-value" id="default-gateway">
                  {dhcpResult.defaultGateway}
                </div>
              </div>
              <div className="result-row">
                <div className="result-label">DHCP服务器：</div>
                <div className="result-value" id="dhcp-server">
                  {dhcpResult.dhcpServer}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn secondary" 
            onClick={() => setCurrentStep(2)}
          >
            <i className="fas fa-arrow-left"></i> 上一步
          </button>
          <button 
            className="btn primary" 
            onClick={detectDhcpAddress}
            disabled={isLoading}
          >
            <i className="fas fa-search"></i> 获取IP地址
          </button>
          <button 
            className="btn success" 
            onClick={saveResult}
            disabled={!dhcpResult || isLoading}
          >
            <i className="fas fa-save"></i> 保存结果
          </button>
        </div>
      </div>
    </div>
  );
};

export default DHCPAddressDetection;
