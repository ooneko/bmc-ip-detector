import { execSync } from 'child_process';
import * as os from 'os';
import * as sudo from 'sudo-prompt';

// 检查管理员权限
export async function checkRootPermission(): Promise<boolean> {
  try {
    const platform = process.platform;
    
    if (platform === 'darwin' || platform === 'linux') {
      // macOS和Linux检查sudo权限
      const result = execSync('id -u').toString().trim();
      return result === '0'; // 返回0表示root用户
    } else if (platform === 'win32') {
      // Windows检查管理员权限
      try {
        execSync('net session', { stdio: 'ignore' });
        return true;
      } catch (e) {
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('检查管理员权限时出错:', error);
    return false;
  }
}

// 请求管理员权限
export async function requestRootPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    const options = {
      name: 'IPMI DHCP Detector',
    };
    
    const platform = process.platform;
    let command = '';
    
    if (platform === 'darwin') {
      command = 'echo "已获取管理员权限"';
    } else if (platform === 'linux') {
      command = 'echo "已获取管理员权限"';
    } else if (platform === 'win32') {
      command = 'net session >nul 2>&1';
    }
    
    sudo.exec(command, options, function(error, stdout, stderr) {
      if (error) {
        console.error('获取管理员权限失败:', error);
        resolve(false);
      } else {
        console.log('已获取管理员权限:', stdout);
        resolve(true);
      }
    });
  });
}

// 安装pcap依赖
export async function installPcapDependency(): Promise<boolean> {
  return new Promise((resolve) => {
    const platform = process.platform;
    
    if (platform === 'darwin') {
      // macOS上，不要使用sudo运行brew
      const { exec } = require('child_process');
      console.log('在macOS上检查并安装libpcap...');
      
      // 先检查是否已安装
      exec('brew list libpcap &>/dev/null || echo "not installed"', (err: Error | null, stdout: string) => {
        if (stdout.trim() === 'not installed') {
          console.log('libpcap未安装，正在安装...');
          exec('brew install libpcap', (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
              console.error('安装libpcap失败:', error);
              resolve(false);
            } else {
              console.log('已安装libpcap:', stdout);
              resolve(true);
            }
          });
        } else {
          console.log('libpcap已安装');
          resolve(true);
        }
      });
    } else {
      // Linux和Windows继续使用sudo
      const options = {
        name: 'IPMI DHCP Detector',
      };
      
      let command = '';
      
      if (platform === 'linux') {
        command = 'apt-get update && apt-get install -y libpcap-dev';
      } else if (platform === 'win32') {
        // Windows需要预先安装Npcap或WinPcap
        command = 'powershell -Command "Write-Host \'请确保已安装Npcap或WinPcap\'"';
      }
      
      sudo.exec(command, options, function(error, stdout) {
        if (error) {
          console.error('安装pcap依赖失败:', error);
          resolve(false);
        } else {
          console.log('已安装pcap依赖:', stdout);
          resolve(true);
        }
      });
    }
  });
} 