import React, { useState } from 'react';
import '../assets/css/main.css';
import Sidebar from './Sidebar';
import DetectionPage from '../pages/DetectionPage';
import HistoryPage from '../pages/HistoryPage';
import HelpPage from '../pages/HelpPage';

// 定义页面类型
type PageType = 'detection' | 'history' | 'help';

const App: React.FC = () => {
  // 当前页面状态
  const [currentPage, setCurrentPage] = useState<PageType>('detection');

  // 渲染当前页面
  const renderPage = () => {
    switch (currentPage) {
      case 'detection':
        return <DetectionPage />;
      case 'history':
        return <HistoryPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <DetectionPage />;
    }
  };

  return (
    <div className="container">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={(page: PageType) => setCurrentPage(page)} 
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default App; 