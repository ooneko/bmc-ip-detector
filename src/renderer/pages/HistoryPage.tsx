import React, { useState, useEffect } from 'react';
import '../assets/css/history.css';

// 定义历史记录项类型
interface HistoryItem {
  id: string;
  timestamp: string;
  serverMac: string;
  manufacturer: string;
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dhcpServer: string;
  interfaceName: string;
}

const HistoryPage: React.FC = () => {
  // 状态定义
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // 获取历史记录
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        
        const electronAPI = (window as any).electronAPI;
        if (!electronAPI) {
          console.error('electronAPI 未定义，可能是预加载脚本未正确加载');
          setHistoryItems([]);
          return;
        }
        
        const history = await electronAPI.getDetectionHistory();
        setHistoryItems(history || []);
      } catch (error) {
        console.error('获取历史记录失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // 删除历史记录项
  const deleteHistoryItem = async (id: string) => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) {
        console.error('electronAPI 未定义，可能是预加载脚本未正确加载');
        return;
      }
      
      const result = await electronAPI.deleteHistoryItem(id);
      
      // 更新本地状态
      setHistoryItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // 如果删除的是当前选中的项，清除选中状态
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('删除历史记录失败:', error);
      alert('删除失败');
    }
  };

  // 清空所有历史记录
  const clearAllHistory = async () => {
    if (!confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      return;
    }

    try {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) {
        console.error('electronAPI 未定义，可能是预加载脚本未正确加载');
        return;
      }
      
      const result = await electronAPI.clearDetectionHistory();
      
      setHistoryItems([]);
      setSelectedItem(null);
    } catch (error) {
      console.error('清空历史记录失败:', error);
      alert('清空失败');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="history-page">
      <header>
        <div className="header-left">
          <div className="header-title">
            <h2>历史记录</h2>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn danger" 
            onClick={clearAllHistory}
            disabled={historyItems.length === 0}
          >
            <i className="fas fa-trash-alt"></i> 清空记录
          </button>
        </div>
      </header>

      <div className="history-content">
        {isLoading ? (
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>加载历史记录中...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="empty-history">
            <i className="fas fa-history"></i>
            <p>暂无历史记录</p>
            <small>检测结果将会显示在这里</small>
          </div>
        ) : (
          <div className="history-container">
            <div className="history-list">
              {historyItems.map(item => (
                <div 
                  key={item.id} 
                  className={`history-item ${selectedItem && selectedItem.id === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="history-item-icon">
                    <i className="fas fa-server"></i>
                  </div>
                  <div className="history-item-content">
                    <div className="history-item-title">
                      <span className="mac-address">{item.serverMac}</span>
                      <span className="manufacturer">{item.manufacturer}</span>
                    </div>
                    <div className="history-item-details">
                      <span className="ip-address">{item.ipAddress}</span>
                      <span className="timestamp">{formatDate(item.timestamp)}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-delete" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                    title="删除"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            <div className="history-details">
              {selectedItem ? (
                <div className="details-container">
                  <div className="details-header">
                    <h3>检测详情</h3>
                    <span className="details-timestamp">{formatDate(selectedItem.timestamp)}</span>
                  </div>
                  
                  <div className="details-section">
                    <h4><i className="fas fa-server"></i> 服务器信息</h4>
                    <div className="details-row">
                      <div className="details-label">MAC地址：</div>
                      <div className="details-value mac-address">{selectedItem.serverMac}</div>
                    </div>
                    <div className="details-row">
                      <div className="details-label">制造商：</div>
                      <div className="details-value">{selectedItem.manufacturer}</div>
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h4><i className="fas fa-network-wired"></i> 网络信息</h4>
                    <div className="details-row">
                      <div className="details-label">IP地址：</div>
                      <div className="details-value">{selectedItem.ipAddress}</div>
                    </div>
                    <div className="details-row">
                      <div className="details-label">子网掩码：</div>
                      <div className="details-value">{selectedItem.subnetMask}</div>
                    </div>
                    <div className="details-row">
                      <div className="details-label">默认网关：</div>
                      <div className="details-value">{selectedItem.defaultGateway}</div>
                    </div>
                    <div className="details-row">
                      <div className="details-label">DHCP服务器：</div>
                      <div className="details-value">{selectedItem.dhcpServer}</div>
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h4><i className="fas fa-info-circle"></i> 其他信息</h4>
                    <div className="details-row">
                      <div className="details-label">网络接口：</div>
                      <div className="details-value">{selectedItem.interfaceName}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <i className="fas fa-arrow-left"></i>
                  <p>请从左侧选择一条历史记录查看详情</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage; 