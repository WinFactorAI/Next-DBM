# Next-DBM

**每一次连接、每一条 SQL 都被审计；数据库变更像代码一样有版本、有审批、可回滚；AI 帮你写 SQL。**
**Every connection and every SQL statement is audited. Database changes get versions, approvals and one-click rollback — just like code. And AI helps you write SQL.**

Next-DBM 是一个企业轻量级数据库审计系统（数据库堡垒机）。 / A lightweight enterprise database audit system — a bastion host for your databases.

[![Actions](https://img.shields.io/github/actions/workflow/status/WinFactorAI/Next-DBM/ci.yml?branch=main&label=Actions&style=flat-square)](https://github.com/WinFactorAI/Next-DBM/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)
[![Docs](https://img.shields.io/badge/Docs-doc.aiputing.com%2Fdbm-2E8B57?style=flat-square)](https://doc.aiputing.com/dbm)
[![Live Demo](https://img.shields.io/badge/Demo-next.typesafe.cn-7B2FBE?style=flat-square)](https://next.typesafe.cn)

**English** ｜ [**中文**](#zh)

---

<a id="en"></a>

## ✨ Feature Overview

<!-- TODO(gif): add img/demo-overview.gif here — a ≤15s full-flow demo: login → connect a database via the proxy → run SQL in the web editor → check the audit log → rollback a version -->

<table>
<tr>
<th width="33%" align="left">🛡️ Database Audit</th>
<th width="33%" align="left">🌿 Version Management</th>
<th width="33%" align="left">🤖 AI Assistance</th>
</tr>
<tr>
<td valign="top">

- Full SQL auditing & traceability — every statement tied to a user, an asset and a session
- Live session monitoring, force disconnect
- Offline session replay (screen recording)
- Sensitive command filtering, with rules per user or group
- Approval workflow for high-risk operations
- Webhook notifications: DingTalk, WeCom, Feishu

</td>
<td valign="top">

- Git-style database versioning — change SQL saved as versioned files
- History restore — rebuild schema & data from any version
- One-click rollback
- DevOps integration: Jenkins / Jira / GitLab / GitHub, from trigger to approval to execution

</td>
<td valign="top">

- AI-written SQL via OpenAI-compatible providers (DeepSeek, etc.)
- Web SQL editor — write and run queries in the browser
- AI-generated SQL still goes through the same audit pipeline and sensitive-command rules

</td>
</tr>
</table>

All databases below are reached through the built-in proxy — you work directly in the browser, no database client to install:

![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?logo=mariadb&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Oracle](https://img.shields.io/badge/Oracle-C74634?style=flat-square)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Redis](https://img.shields.io/badge/Redis-FF4438?logo=redis&logoColor=white&style=flat-square)
![GaussDB](https://img.shields.io/badge/GaussDB-2F6BFF?style=flat-square)
![TDengine](https://img.shields.io/badge/TDengine-009FB7?style=flat-square)

Also on board: LDAP/AD unified identity · RBAC · two-factor authentication · login policies · scheduled tasks · batch execution · export · system monitoring · multi-language UI · dark theme.

## 🚀 Quick Start in 5 Minutes

```bash
git clone https://github.com/WinFactorAI/Next-DBM.git
cd Next-DBM
docker compose -f demos/docker-compose.yml up -d
```

Open `http://localhost:8088` (or whichever port `demos/docker-compose.yml` maps) and log in with the default account **admin / admin**. Since this is a bastion system, your first move after login should be changing that default password.

For production deployment (HTTPS, external MySQL, etc.), see the [documentation](https://doc.aiputing.com/dbm).

## 🎮 Live Demo

| Entry | Address | Account |
| --- | --- | --- |
| Web console | <https://next.typesafe.cn> | test / test |
| SSH server | `ssh test@next.typesafe.cn -p 2022` | test / test |

The web console covers day-to-day SQL work. If you prefer a terminal, connect to the SSH server and reach your authorized databases from your own client. The demo environment is reset periodically — don't put real data in it.

## Core Scenarios

### 1. Daily operations, fully audited

DBAs and developers connect through the built-in proxy and work in the browser — nothing to install. Every SQL statement is recorded; sensitive commands are filtered by rule; a suspicious live session can be force-disconnected on the spot; offline screen recordings keep after-the-fact investigation grounded in evidence.

<!-- TODO(screenshot): add img/scenario-audit.png here — session monitoring + SQL audit list + offline replay -->

### 2. Ship database changes like code

Change SQL is saved as versioned files. High-risk changes go through approval first, and Jenkins / Jira / GitLab / GitHub can drive the whole flow: trigger → approve → execute. When a change goes wrong, roll the database back to any historical version with one click.

<!-- TODO(screenshot): add img/scenario-version.png here — version list + approval dialog + one-click rollback -->

### 3. Let AI write the SQL

Plug in an OpenAI-compatible provider such as DeepSeek, describe what you need in the Web SQL editor, and get SQL that's ready to run. Execution still passes through auditing and sensitive-command filtering — convenience doesn't buy an exemption.

<!-- TODO(screenshot): add img/scenario-ai.png here — AI SQL editor in action -->

## Docs & Community

- 📖 Documentation: <https://doc.aiputing.com/dbm>
- 🌐 Official website: <https://next-dbm.aiputing.com>
- 💬 WeChat group: scan the QR code below
- 🐧 QQ group: 938145268
- ✈️ Telegram: <https://t.me/next_dbm>

<img src="./img/weixinq-1.jpg" width="240" alt="Next-DBM WeChat group" />

## License

The open-source core of Next-DBM is licensed under the [Apache License 2.0](LICENSE). Enterprise features and commercial licensing are available via the official website: <https://next-dbm.aiputing.com>.

Next-DBM is a derivative work of the open-source project [Next Terminal](https://github.com/dushixiang/next-terminal) (Apache-2.0), significantly modified and extended for enterprise database audit and version management.

If you plan to deploy Next-DBM inside a corporate network, get your IT / security team's approval first. The software is provided as-is, without warranty of any kind.

---

<a id="zh"></a>

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

| 入口 | 地址 | 账号 |
| --- | --- | --- |
| Web 控制台 | <https://next.typesafe.cn> | test / test |
| SSH Server | `ssh test@next.typesafe.cn -p 2022` | test / test |

Web 控制台覆盖日常的 SQL 操作；习惯终端的话，直接连 SSH Server，用本地客户端访问授权的数据库资源。演示环境会定期重置，请勿放入真实数据。

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

Next-DBM 开源核心遵循 [Apache License 2.0](LICENSE)。企业功能与商业授权请访问官网：<https://next-dbm.aiputing.com>。

本项目基于开源项目 [Next Terminal](https://github.com/dushixiang/next-terminal)（Apache-2.0）二次开发并大幅扩展，聚焦企业数据库审计与版本管理场景。

如需在企业网络内部署 Next-DBM，建议先取得 IT / 安全团队的同意。本项目按"现状"提供，不附带任何担保。

---

## 📸 待补截图清单

> 素材补齐后请删除本节。 / Remove this section once the assets are in place.

- [ ] 总览 GIF：`img/demo-overview.gif`（≤ 15 秒：登录 → 代理连库 → Web 编辑器执行 SQL → 查看审计 → 回滚版本）
- [ ] 场景一截图：`img/scenario-audit.png`（会话监控 + SQL 审计列表 + 离线回放）
- [ ] 场景二截图：`img/scenario-version.png`（版本列表 + 审批 + 一键回滚）
- [ ] 场景三截图：`img/scenario-ai.png`（AI SQL 编辑器）
- [ ] 提交 `demos/docker-compose.yml`（快速开始命令引用了该文件，当前仓库还没有）
- [ ] GitHub Actions 徽章按 `ci.yml` 生成，启用 CI 后请核对 workflow 文件名
- [ ] 官网授权页地址确定后，替换「授权说明」中的官网链接为直达地址
