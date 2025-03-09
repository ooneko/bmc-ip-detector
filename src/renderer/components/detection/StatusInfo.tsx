import React from 'react';
import { DHCPResult } from '../../types';

interface StatusInfoProps {
  interfaceStatus: string;
  serverMac: string;
  dhcpResult: DHCPResult | null;
}

const StatusInfo: React.FC<StatusInfoProps> = ({
  interfaceStatus,
  serverMac,
  dhcpResult
}) => {
  return (
    <div className="status-info">
      <div className="card">
        <div className="card-icon success">
          <i className="fas fa-ethernet"></i>
        </div>
        <div className="card-info">
          <h3>网络接口状态</h3>
          <p id="interface-status">{interfaceStatus}</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-icon info">
          <i className="fas fa-fingerprint"></i>
        </div>
        <div className="card-info">
          <h3>当前MAC地址</h3>
          <p id="current-mac" className="mac-address">{serverMac}</p>
          <small className="copy-indicator" id="mac-copy-hint">点击复制</small>
        </div>
      </div>
      
      <div className="card">
        <div className="card-icon warning">
          <i className="fas fa-network-wired"></i>
        </div>
        <div className="card-info">
          <h3>当前IP地址</h3>
          <p id="current-ip">{dhcpResult ? dhcpResult.ipAddress : '--.--.--.--'}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusInfo; 