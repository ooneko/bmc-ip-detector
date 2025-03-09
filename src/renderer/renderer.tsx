import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// 导入 CSS 样式
import './assets/css/main.css';

// 渲染React应用
const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />); 