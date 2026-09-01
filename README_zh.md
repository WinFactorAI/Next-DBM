# Next-DBM

**每一次连接、每一条 SQL 都被审计；数据库变更像代码一样有版本、有审批、可回滚；AI 帮你写 SQL。**

Next-DBM 是一个企业轻量级数据库审计系统（数据库堡垒机）。

[![Actions](https://img.shields.io/github/actions/workflow/status/WinFactorAI/Next-DBM/ci.yml?branch=main&label=Actions&style=flat-square)](https://github.com/WinFactorAI/Next-DBM/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)
[![Docs](https://img.shields.io/badge/Docs-doc.aiputing.com%2Fdbm-2E8B57?style=flat-square)](https://doc.aiputing.com/dbm)
[![Live Demo](https://img.shields.io/badge/Demo-nddemo.aiputing.com-7B2FBE?style=flat-square)](http://nddemo.aiputing.com)

[**English**](README.md) ｜ **中文**

---

## ✨ 特性总览

<!-- TODO(gif): 在此处添加 img/demo-overview.gif —— 建议不超过 15 秒：登录 → 通过代理连接数据库 → 在 Web 编辑器执行 SQL → 查看审计日志 → 回滚一个版本 -->

<table>
<tr>
<th width="33%" align="left">🛡️ 数据库审计</th>
<th width="33%" align="left">🌿 版本管理</th>
<th width="33%" align="left">🤖 AI 辅助</th>
</tr>
<tr>
<td valign="top">

- 全量 SQL 审计与追溯，每条语句都能对应到人、资产与会话
- 在线会话监控，可强制断开
- 离线录屏回放
- 敏感命令过滤，按用户 / 用户组自定义规则
- 高危操作审批流
- Webhook 通知：钉钉、企业微信、飞书

</td>
<td valign="top">

- Git 化数据库版本管理，变更 SQL 像代码一样存成版本文件
- 历史还原，可从任意版本重建表结构与数据
- 一键回滚
- DevOps 联动：Jenkins / Jira / GitLab / GitHub，触发 → 审批 → 执行

</td>
<td valign="top">

- 接入 DeepSeek 等 OpenAI 兼容渠道，AI 帮你写 SQL
- Web SQL 编辑器，在浏览器里写查询、跑查询
- AI 生成的 SQL 同样经过审计与敏感命令过滤

</td>
</tr>
</table>

以下数据库全部通过内置代理访问，直接在浏览器里操作，无需安装数据库客户端：

![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?logo=mariadb&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Oracle](https://img.shields.io/badge/Oracle-C74634?style=flat-square)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Redis](https://img.shields.io/badge/Redis-FF4438?logo=redis&logoColor=white&style=flat-square)
![GaussDB](https://img.shields.io/badge/GaussDB-2F6BFF?style=flat-square)
![TDengine](https://img.shields.io/badge/TDengine-009FB7?style=flat-square)

平台能力不止这些：LDAP/AD 统一身份 · RBAC · 双因素认证 · 登录策略 · 计划任务 · 批量执行 · 导出 · 系统监控 · 多语言 · 暗色主题。

## 🚀 5 分钟上手

```bash
git clone https://github.com/WinFactorAI/Next-DBM.git
cd Next-DBM
docker compose -f demos/docker-compose.yml up -d
```

打开 `http://localhost:8088`（以 `demos/docker-compose.yml` 的端口映射为准），用默认账号 **admin / admin** 登录。这是套堡垒机，登录后第一件事就是把默认密码改掉。

生产环境部署（HTTPS、外接 MySQL 等）请参考[文档](https://doc.aiputing.com/dbm)。

## 🎮 在线体验

浏览器打开 <http://nddemo.aiputing.com>。演示账号请关注公众号（扫描下方二维码），回复 "nd" 获取。

<img src="https://www.aiputing.com/assets/img/winFactor.jpg" width="180" alt="关注公众号回复 nd 获取演示账号" />

演示环境会定期重置，请勿放入真实数据。

## 核心场景

### 1. 日常运维，全程留痕

DBA 和开发通过内置代理连库，直接在浏览器里干活，不用装客户端。每一条 SQL 都有记录，敏感命令按规则拦截；发现可疑会话可以当场强制断开，离线录屏让事后追查有据可依。

<!-- TODO(screenshot): 在此处添加 img/scenario-audit.png —— 会话监控 + SQL 审计列表 + 离线回放 -->

### 2. 数据库变更像代码一样发布

变更 SQL 保存成版本文件，高危变更先过审批；Jenkins / Jira / GitLab / GitHub 可以驱动完整流程：触发 → 审批 → 执行。变更出了问题，一键回滚到任意历史版本。

<!-- TODO(screenshot): 在此处添加 img/scenario-version.png —— 版本列表 + 审批 + 一键回滚 -->

### 3. AI 帮你写 SQL

接入 DeepSeek 等 OpenAI 兼容渠道，在 Web SQL 编辑器里描述需求，直接拿到可执行的 SQL。执行照样走审计和敏感命令过滤——方便不等于豁免。

<!-- TODO(screenshot): 在此处添加 img/scenario-ai.png —— AI SQL 编辑器实际使用画面 -->

## 文档与社区

- 📖 文档：<https://doc.aiputing.com/dbm>
- 🌐 官网：<https://next-dbm.aiputing.com>
- 💬 微信群：扫描下方二维码
- 🐧 QQ 群：938145268
- ✈️ Telegram：<https://t.me/next_dbm>

<img src="./img/weixinq-1.jpg" width="240" alt="Next-DBM 微信群二维码" />

## 授权说明

Next-DBM 开源核心遵循 Apache License 2.0。企业功能与商业授权请访问官网：<https://next-dbm.aiputing.com>。


---

## 📸 待补截图清单

> 素材补齐后请删除本节。

- [ ] 总览 GIF：`img/demo-overview.gif`（≤ 15 秒：登录 → 代理连库 → Web 编辑器执行 SQL → 查看审计 → 回滚版本）
- [ ] 场景一截图：`img/scenario-audit.png`（会话监控 + SQL 审计列表 + 离线回放）
- [ ] 场景二截图：`img/scenario-version.png`（版本列表 + 审批 + 一键回滚）
- [ ] 场景三截图：`img/scenario-ai.png`（AI SQL 编辑器）
- [ ] 提交 `demos/docker-compose.yml`（快速开始命令引用了该文件，当前仓库还没有）
- [ ] GitHub Actions 徽章按 `ci.yml` 生成，启用 CI 后请核对 workflow 文件名
- [ ] 官网授权页地址确定后，替换「授权说明」中的官网链接为直达地址
- [ ] 如需固定演示账号（如 test / test），在演示环境创建后更新「在线体验」一节
