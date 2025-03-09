import React from 'react';
import '../assets/css/sidebar.css';

// 定义页面类型
type PageType = 'detection' | 'history' | 'help';

// 定义组件属性
interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  return (
    <nav className="sidebar">
      <div className="logo">
        <i className="fas fa-server"></i>
        <span>IPMI检测器</span>
      </div>
      <ul className="nav-links">
        <li className={currentPage === 'detection' ? 'active' : ''}>
          <a href="#" onClick={() => onPageChange('detection')}>
            <i className="fas fa-network-wired"></i>
            <span>网络检测</span>
          </a>
        </li>
        <li className={currentPage === 'history' ? 'active' : ''}>
          <a href="#" onClick={() => onPageChange('history')}>
            <i className="fas fa-history"></i>
            <span>历史记录</span>
          </a>
        </li>
        <li className={currentPage === 'help' ? 'active' : ''}>
          <a href="#" onClick={() => onPageChange('help')}>
            <i className="fas fa-question-circle"></i>
            <span>帮助</span>
          </a>
        </li>
      </ul>
      <div className="system-info">
        <span id="version">版本: 1.0.0</span>
      </div>
    </nav>
  );
};

export default Sidebar; 