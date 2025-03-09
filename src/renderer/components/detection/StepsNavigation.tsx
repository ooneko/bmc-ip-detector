import React from 'react';
import { DetectionStep } from '../../types';

interface StepsNavigationProps {
  currentStep: DetectionStep;
  completedSteps: DetectionStep[];
}

const StepsNavigation: React.FC<StepsNavigationProps> = ({
  currentStep,
  completedSteps
}) => {
  return (
    <div className="steps-container">
      <div className="steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${completedSteps.includes(1) ? 'completed' : ''}`} id="step1">
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">连接服务器，并选择网络设备</div>
            <div className="step-desc">连接服务器并选择用于检测的网络适配器</div>
          </div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${completedSteps.includes(2) ? 'completed' : ''}`} id="step2">
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">复制服务器MAC地址</div>
            <div className="step-desc">接收服务器DHCP广播包并记录MAC地址</div>
          </div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''} ${completedSteps.includes(3) ? 'completed' : ''}`} id="step3">
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">连接交换机获取地址</div>
            <div className="step-desc">使用服务器MAC地址向DHCP请求IP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepsNavigation;
