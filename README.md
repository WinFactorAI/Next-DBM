

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

QQ Group: <br/>
<img src="https://license.aiputing.com/static/media/qq-next-dbm.452f09681876a5433557.jpg" width="30%" style="border: 0px;">

Email: business@aiputing.com

## Download Link

Download: <a href="https://f.aiputing.com/?p=Next-DBM%2F" target="_blank" rel="noopener noreferrer">f.aiputing.com/?p=Next-DBM%2F</a>

## License

All rights reserved  

Copyright: Beijing Shengli Yinzi Technology Co., Ltd.  

Website: <a href="https://license.aiputing.com" target="_blank" rel="noopener noreferrer">license.aiputing.com</a>  

## Project Status

ReleasedThis is an automated change - 2026-01-02 17:51:25
