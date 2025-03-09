import React, { useState } from 'react';
import '../assets/css/help.css';

// 定义FAQ项类型
interface FAQItem {
  question: string;
  answer: string;
}

const HelpPage: React.FC = () => {
  // FAQ列表
  const faqItems: FAQItem[] = [
    {
      question: '什么是IPMI带外检测器？',
      answer: 'IPMI带外检测器是一款用于服务器管理的实用工具，帮助网络管理员和系统管理员快速获取服务器的IPMI网络信息。通过简单的步骤，您可以获取服务器的MAC地址，并使用该MAC地址向DHCP服务器请求IP地址。'
    },
    {
      question: '如何使用IPMI带外检测器？',
      answer: '使用IPMI带外检测器的步骤如下：\n1. 选择一个可用的网络接口\n2. 使用网线将您的计算机直接连接到服务器的IPMI网口\n3. 获取服务器的MAC地址\n4. 断开服务器连接，将您的计算机连接到网络交换机\n5. 使用已获取的MAC地址，请求DHCP服务器分配IP地址\n6. 查看并保存结果'
    },
    {
      question: '为什么需要获取服务器的MAC地址？',
      answer: '服务器的IPMI网口有一个唯一的MAC地址。DHCP服务器使用这个MAC地址来分配IP地址。通过获取MAC地址并使用它来请求DHCP，您可以获取服务器IPMI接口的网络配置，而无需直接访问服务器的管理界面。'
    },
    {
      question: '我无法获取服务器的MAC地址，怎么办？',
      answer: '如果您无法获取服务器的MAC地址，请检查以下几点：\n1. 确保服务器已开机\n2. 确保网线正确连接到服务器的IPMI网口\n3. 确保您选择了正确的网络接口\n4. 尝试使用不同的网线\n5. 确保您的计算机网络接口工作正常'
    },
    {
      question: '我无法获取DHCP地址，怎么办？',
      answer: '如果您无法获取DHCP地址，请检查以下几点：\n1. 确保网线正确连接到网络交换机\n2. 确保网络交换机已连接到DHCP服务器\n3. 确保DHCP服务器正常工作\n4. 尝试手动刷新DHCP请求\n5. 检查MAC地址是否正确'
    },
    {
      question: '我可以在哪些操作系统上使用IPMI带外检测器？',
      answer: 'IPMI带外检测器支持Windows、macOS和Linux等主流操作系统。具体要求如下：\n- Windows: Windows 7 SP1或更高版本\n- macOS: macOS 10.13或更高版本\n- Linux: Ubuntu 18.04、CentOS 7或其他主流发行版'
    },
    {
      question: '使用IPMI带外检测器需要特殊权限吗？',
      answer: '是的，IPMI带外检测器需要管理员/root权限才能访问网络接口和执行网络操作。在Windows上，您需要以管理员身份运行应用程序；在macOS和Linux上，您可能需要输入管理员密码或使用sudo命令。'
    }
  ];

  // 当前展开的FAQ项
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // 切换FAQ项的展开状态
  const toggleFAQ = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <div className="help-page">
      <header>
        <div className="header-left">
          <div className="header-title">
            <h2>帮助</h2>
          </div>
        </div>
      </header>

      <div className="help-content">
        <div className="help-section">
          <h3>使用指南</h3>
          <div className="guide-container">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>连接服务器并选择网络设备</h4>
                <p>在应用程序中，选择一个可用的网络接口，用于连接服务器和交换机。</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>连接服务器</h4>
                <p>使用网线将您的计算机直接连接到服务器的IPMI网口，然后点击"检测连接"按钮获取MAC地址。</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>连接交换机</h4>
                <p>断开服务器连接，将网线连接到交换机，系统将使用服务器的MAC地址向DHCP服务器请求IP地址。</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>查看结果</h4>
                <p>获取到IP地址后，您可以查看完整的网络配置信息，并保存结果以便后续查询。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h3>常见问题</h3>
          <div className="faq-container">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className={`faq-item ${expandedIndex === index ? 'expanded' : ''}`}
              >
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{item.question}</span>
                  <i className={`fas ${expandedIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </div>
                <div className="faq-answer">
                  {item.answer.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="help-section">
          <h3>关于</h3>
          <div className="about-container">
            <div className="about-info">
              <p><strong>IPMI带外检测器</strong> 版本 1.0.0</p>
              <p>© 2025 ooneko. 保留所有权利。</p>
              <p>本软件采用MIT许可证。</p>
            </div>
            <div className="contact-info">
              <p>如有问题或建议，请联系：</p>
              <p><i className="fas fa-envelope"></i> binhong.hua@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;