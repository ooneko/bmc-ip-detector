# IPMI带外检测器

IPMI带外检测器是一款用于服务器管理的实用工具，帮助网络管理员和系统管理员快速获取服务器的IPMI网络信息。

## 功能特点

- **MAC地址检测**：连接服务器时自动检测并获取服务器网口MAC地址
- **DHCP请求**：使用获取到的MAC地址向交换机/DHCP服务器请求IP地址
- **跨平台支持**：支持Windows、Linux、macOS等多种操作系统
- **历史记录**：保存检测结果，方便后续查询
- **直观界面**：简洁明了的用户界面，操作简单

## 工作原理

IPMI带外检测器的工作原理如下：

1. 通过网线连接服务器和个人电脑，获取服务器的MAC地址
2. 然后将网线连接个人电脑和交换机，利用服务器网口的MAC地址向交换机获取DHCP IP地址
3. 将获取到的IP地址和网络配置信息显示给用户

## 系统要求

- **Windows**: Windows 7 SP1或更高版本
- **macOS**: macOS 10.13或更高版本
- **Linux**: Ubuntu 18.04、CentOS 7或其他主流发行版
- 需要管理员/root权限以访问网络接口
- 一个可用的网络接口

## 界面预览

该项目包含以下界面：

- 网络检测：进行MAC地址获取和DHCP请求的主要功能页
- 历史记录：查看之前的检测记录
- 帮助：操作指南和常见问题


## 使用指南
1. 确保您的计算机有一个可用的网络接口
2. 使用网线将您的计算机直接连接到服务器的IPMI网口
3. 在应用程序中，进入"网络检测"页面，按照步骤获取服务器MAC地址
4. 断开服务器连接，将您的计算机连接到网络交换机
5. 使用已获取的MAC地址，请求DHCP服务器分配IP地址
6. 查看并保存结果


## TODO LIST
1. 步骤一和步骤三（连接服务器并选择网络设备时以及连接交换机）的帮助图示，使用动图
2. 在readme添加演示动画和截图。
3. 将libpcap 编译成静态库，避免客户端在使用时安装。
4. 将程序打包成可直接执行的二进制，放在release中供大家下载使用。

## 许可证
本项目采用MIT许可证。详情请参阅LICENSE文件。

## 开发者
binhong.hua@gmail.com