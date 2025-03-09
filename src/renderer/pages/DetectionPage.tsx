import React, { useState, useEffect } from 'react';
import '../assets/css/detection.css';
import { NetworkInterface, DetectionStep, DHCPResult } from '../types';
import InterfaceSelection from '../components/detection/InterfaceSelection';
import MacAddressDetection from '../components/detection/MacAddressDetection';
import DHCPAddressDetection from '../components/detection/DhcpAddressDetection';
import StepsNavigation from '../components/detection/StepsNavigation';
import StatusInfo from '../components/detection/StatusInfo';

const DetectionPage: React.FC = () => {
  // 状态定义
  const [networkInterfaces, setNetworkInterfaces] = useState<NetworkInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<DetectionStep>(1);
  const [completedSteps, setCompletedSteps] = useState<DetectionStep[]>([]);
  const [interfaceStatus, setInterfaceStatus] = useState<string>('等待检测...');
  const [serverMac, setServerMac] = useState<string>('--:--:--:--:--:--');
  const [manufacturer, setManufacturer] = useState<string>('未知');
  const [dhcpResult, setDhcpResult] = useState<DHCPResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(180); // 3分钟倒计时
  const [progress, setProgress] = useState<number>(0); // 进度百分比
  const [listenTimerId, setListenTimerId] = useState<NodeJS.Timeout | null>(null); // 计时器ID
  const [isImageEnlarged, setIsImageEnlarged] = useState<boolean>(false); // 图片是否放大

  // 创建一个包装函数，用于处理步骤变更，解决类型不匹配问题
  const handleStepChange = (step: number) => {
    setCurrentStep(step as DetectionStep);
  };

  // 获取网络接口列表
  const fetchNetworkInterfaces = async () => {
    try {
      setIsLoading(true);
      
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) {
        console.error('electronAPI 未定义，可能是预加载脚本未正确加载');
        setNetworkInterfaces([]);
        return;
      }
      
      const interfaces = await electronAPI.getNetworkInterfaces();
      console.log('获取到的网络接口:', interfaces);
      
      if (interfaces && interfaces.length > 0) {
        // 过滤掉无线网卡，只保留有线网卡
        const wiredInterfaces = interfaces.filter((iface: NetworkInterface) => iface.type !== 'wireless');
        console.log('过滤后的有线网络接口:', wiredInterfaces);
        
        setNetworkInterfaces(wiredInterfaces);
        
        // 尝试选择第一个可用的接口（如果有）
        if (wiredInterfaces.length > 0) {
          setSelectedInterface(wiredInterfaces[0].iface || wiredInterfaces[0].ifaceName);
          console.log('自动选择的接口:', wiredInterfaces[0].iface || wiredInterfaces[0].ifaceName);
        } else {
          console.warn('未检测到有效的有线网络接口');
          setSelectedInterface('');
        }
      } else {
        console.warn('未检测到有效的网络接口');
      }
    } catch (error) {
      console.error('获取网络接口失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化时获取网络接口
  useEffect(() => {
    fetchNetworkInterfaces();
  }, []);

  // 检查网络接口状态
  const checkInterfaceStatus = async () => {
    try {
      setIsLoading(true);
      setInterfaceStatus('正在检测...');
      
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) {
        setInterfaceStatus('错误: API未加载');
        return;
      }
      
      const status = await electronAPI.checkInterfaceStatus(selectedInterface);
      console.log('接口状态检测结果:', status);
      
      // 只有当接口状态为已连接时，才允许进入下一步
      if (status.connected) {
        setInterfaceStatus('已连接 - 网络接口正常');
        setCurrentStep(2);
        setCompletedSteps(prev => [...prev, 1]);
        
        // 重置倒计时和进度
        setCountdown(180);
        setProgress(0);
        
        // 自动开始监听DHCP广播，使用setTimeout以确保状态更新和UI渲染完成后再调用
        setTimeout(() => {
          detectServerMac();
        }, 500);
      } else {
        setInterfaceStatus('未连接 - 请确保服务器已通过网线连接');
        // 不进入下一步，等待连接成功
      }
    } catch (error) {
      console.error('检查接口状态失败:', error);
      setInterfaceStatus('检测失败 - 请重试');
      // 出错时不进入下一步
    } finally {
      setIsLoading(false);
    }
  };

  // 清理计时器
  const clearListenTimer = () => {
    if (listenTimerId) {
      clearInterval(listenTimerId);
      setListenTimerId(null);
    }
  };

  // 在组件卸载时清理计时器
  useEffect(() => {
    return () => {
      clearListenTimer();
    };
  }, []);

  // 检测IPMI服务器MAC地址
  const detectServerMac = async () => {
    try {
      // 清理之前的计时器
      clearListenTimer();
      
      setIsLoading(true);
      setServerMac('正在检测...');
      setManufacturer('正在识别...');
      setCountdown(180); // 重置倒计时为3分钟
      setProgress(0); // 重置进度条
      
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) {
        setServerMac('错误: API未加载');
        setManufacturer('未知');
        return;
      }
      
      // 启动倒计时
      const timerStart = Date.now();
      const totalTime = 180 * 1000; // 3分钟，单位毫秒
      
      const timerId = setInterval(() => {
        const elapsedTime = Date.now() - timerStart;
        const remainingSeconds = Math.max(0, Math.ceil((totalTime - elapsedTime) / 1000));
        const currentProgress = Math.min(100, (elapsedTime / totalTime) * 100);
        
        setCountdown(remainingSeconds);
        setProgress(currentProgress);
        
        // 如果倒计时结束，则停止监听
        if (remainingSeconds <= 0) {
          clearInterval(timerId);
          setListenTimerId(null);
          
          // 如果在定时器结束时仍在加载状态，表示未收到结果，标记为超时
          if (isLoading) {
            setIsLoading(false);
            setServerMac('未检测到（已超时）');
            setManufacturer('未知');
          }
        }
      }, 1000);
      
      setListenTimerId(timerId);
      
      // 监听服务器发来的DHCP广播包
      const result = await electronAPI.startDhcpDetection(selectedInterface);
      console.log('检测结果:', result);
      
      // 清理计时器
      clearListenTimer();
      
      if (result && result.success) {
        setServerMac(result.macAddress);
        setManufacturer(result.manufacturer || '未知');
        // 仅当成功接收到DHCP广播包并获取MAC地址时，才允许进入第三步
        setCurrentStep(3);
        setCompletedSteps(prev => [...prev, 2]);
      } else {
        setServerMac('未检测到');
        setManufacturer('未知');
        // 未检测到服务器MAC，不进入下一步
      }
    } catch (error) {
      console.error('检测服务器MAC失败:', error);
      setServerMac('检测失败');
      setManufacturer('未知');
      // 清理计时器
      clearListenTimer();
    } finally {
      setIsLoading(false);
    }
  };

  // 检测DHCP地址和相关信息
  const detectDhcpAddress = async () => {
    try {
      setIsLoading(true);
      setDhcpResult(null);
      
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) {
        console.error('API未加载');
        return;
      }
      
      const result = await electronAPI.getDhcpAddress(selectedInterface, serverMac);
      console.log('DHCP结果:', result);
      
      if (result && result.success) {
        setDhcpResult(result);
      }
    } catch (error) {
      console.error('检测DHCP地址失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存检测结果
  const saveResult = async () => {
    try {
      setIsLoading(true);
      
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) {
        console.error('API未加载');
        return;
      }
      
      const data = {
        timestamp: new Date().toISOString(),
        serverMac,
        manufacturer,
        dhcpInfo: dhcpResult,
        interfaceName: selectedInterface
      };
      
      const result = await electronAPI.saveDetectionResult(data);
      console.log('保存结果:', result);
      
      if (result && result.success) {
        alert('检测结果已成功保存到历史记录！');
        setCompletedSteps(prev => [...prev, 3]);
      }
    } catch (error) {
      console.error('保存结果失败:', error);
      alert('保存结果失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <InterfaceSelection
            networkInterfaces={networkInterfaces}
            selectedInterface={selectedInterface}
            setSelectedInterface={setSelectedInterface}
            checkInterfaceStatus={checkInterfaceStatus}
            fetchNetworkInterfaces={fetchNetworkInterfaces}
            isLoading={isLoading}
            isImageEnlarged={isImageEnlarged}
            setIsImageEnlarged={setIsImageEnlarged}
          />
        );
      
      case 2:
        return (
          <MacAddressDetection
            interfaceStatus={interfaceStatus}
            serverMac={serverMac}
            manufacturer={manufacturer}
            isLoading={isLoading}
            countdown={countdown}
            progress={progress}
            detectServerMac={detectServerMac}
            setCurrentStep={handleStepChange}
            clearListenTimer={clearListenTimer}
          />
        );
      
      case 3:
        return (
          <DHCPAddressDetection
            serverMac={serverMac}
            dhcpResult={dhcpResult}
            isLoading={isLoading}
            detectDhcpAddress={detectDhcpAddress}
            saveResult={saveResult}
            setCurrentStep={handleStepChange}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="detection-page">
      <header>
        <div className="header-left">
          <div className="header-title">
            <h2>网络检测</h2>
          </div>
        </div>
      </header>

      <div className="detection-content">
        <StatusInfo
          interfaceStatus={interfaceStatus}
          serverMac={serverMac}
          dhcpResult={dhcpResult}
        />
        
        <StepsNavigation
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        <div className="panel-container">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default DetectionPage;