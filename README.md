

# Next-DBM Database Audit System

[English](README.md) ｜ [中文](README_zh.md)

Next-DBM is a lightweight enterprise database audit and version management system.  
It supports database connection log auditing, unified proxy permission management, data versioning, automated database script deployment, and basic database management through a web interface.

## Project Description

Next-DBM solves challenges in iterative database development, including audit management, version control, automated script deployment, and basic database management via the web.
:::info{title=Demo Link}
Demo: <a href="http://nddemo.aiputing.com/#/login" target="_blank" rel="noopener noreferrer">Click to try</a><br/>
<img src="https://www.aiputing.com/assets/img/winFactor.jpg" width="200" style="border: 0px;">
<br/>
Follow our official WeChat account and reply with "nd" to receive a demo account.<br/>
:::
![Logo](https://f.aiputing.com/raw/static/Next-DBM/dev.png)

### 1. Multiple Databases  
Supports connecting to multiple types of databases using the proxy. Compatible with MySQL, MariaDB, Oracle, SQLServer, PostgreSQL, MongoDB, Redis, and more.

### 2. Web Management  
Manage databases through the web interface.  
Supports TCP proxy connections, connection status monitoring, and audit management commands.

![Logo](https://f.aiputing.com/raw/static/Next-DBM/agent.png)

### 3. Database Version Management <Badge type="success">Core</Badge>    
Save SQL statements as files and manage them via Git. Key table structures and data are version-controlled on the server.

### 4. Database Synchronization <Badge type="success">Core</Badge>    
Restore databases from historical versions. Supports restoring to new or existing databases.

### 5. Sensitive Command Filtering <Badge type="warning">Highlight</Badge>    
Define custom sensitive rules to control commands per user or group.

### 6. Command Version Build <Badge type="warning">Highlight</Badge>    
Trigger commands to manage version backups, e.g., ALTER, INSERT, UPDATE, DELETE commands.

### 7. Historical Version Control <Badge type="warning">Highlight</Badge>     
Filter versions by table structure and data to manage historical backups.

### 8. Unified Identity Management <Badge type="success">Core</Badge>   
LDAP/AD integration: synchronize organizational structure and roles.  
RBAC permissions: fine-grained control at file-level, edit, and sharing permissions.

### 9. Proxy Service Management <Badge type="success">Core</Badge>   
Control and manage proxies for different database ports.

### 10. Push Notifications <Badge type="warning">Highlight</Badge>
Supports webhook notifications for database assets, disconnections, and user-asset relationship triggers.  
Compatible with DingTalk, WeChat Work, Feishu, and other platforms.

### 11. Log Auditing <Badge type="success">Core</Badge>
Audit database connection logs and user-asset interactions.  
Supports full SQL execution logging and status auditing.

### 12. Data Permission Management <Badge type="success">Core</Badge>
Manage data permissions based on user-asset relationships.

### 13. Connection Monitoring <Badge type="success">Core</Badge>
Monitor connections per user-asset relationship. Track user actions on assets.

### 14. Additional Features <Badge>Basic</Badge>  
Multi-language support, theme switching, default Chinese and English support, and custom language import.  
Log cleaning cycles.  
System backup and restore settings.

## Interface Screenshots

![Logo](https://f.aiputing.com/raw/static/Next-DBM/1.png)  

![Logo](https://f.aiputing.com/raw/static/Next-DBM/5.1.png) 
![Logo](https://f.aiputing.com/raw/static/Next-DBM/5.2.png) 
![Logo](https://f.aiputing.com/raw/static/Next-DBM/5.3.png) 
![Logo](https://f.aiputing.com/raw/static/Next-DBM/5.4.png) 
![Logo](https://f.aiputing.com/raw/static/Next-DBM/2.png)  
![Logo](https://f.aiputing.com/raw/static/Next-DBM/3.png)  
![Logo](https://f.aiputing.com/raw/static/Next-DBM/4.png)  
![Logo](https://f.aiputing.com/raw/static/Next-DBM/5.png)  
![Logo](https://f.aiputing.com/raw/static/Next-DBM/6.png)  
![Logo](https://f.aiputing.com/raw/static/Next-DBM/7.png)  
![Logo](https://f.aiputing.com/raw/static/Next-DBM/8.png)

## Support Channels

WeChat Group: <br/>
<img src="./img/weixinq-1.jpg" width="30%" style="border: 0px;">
<!-- QQ Group: <br/>
<img src="https://license.aiputing.com/static/media/qq-next-dbm.452f09681876a5433557.jpg" width="30%" style="border: 0px;"> -->

Email: business@aiputing.com

## Download Link

Download: <a href="https://f.aiputing.com/?p=Next-DBM%2F" target="_blank" rel="noopener noreferrer">f.aiputing.com/?p=Next-DBM%2F</a>

## 协议与条款
如您需要在企业网络中使用 Next-DBM，建议先征求 IT 管理员的同意。下载、使用或分发 Next-DBM 前，您必须同意 协议 条款与限制。本项目不提供任何担保，亦不承担任何责任。

## License


Next-DBM is a derivative work based on the open-source
project **Next Terminal**, which is licensed under the
Apache License, Version 2.0.

Original code and derived portions remain subject to
the Apache License, Version 2.0.

The project has been significantly modified and extended
to focus on enterprise database audit and version
management scenarios.

See the LICENSE file for details.This is an automated change - 2026-01-28 07:41:26
