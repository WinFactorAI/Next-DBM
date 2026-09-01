# Next-DBM

**Every connection and every SQL statement is audited. Database changes get versions, approvals and one-click rollback — just like code. And AI helps you write SQL.**

A lightweight enterprise database audit system — a bastion host for your databases.

[![Actions](https://img.shields.io/github/actions/workflow/status/WinFactorAI/Next-DBM/ci.yml?branch=main&label=Actions&style=flat-square)](https://github.com/WinFactorAI/Next-DBM/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)
[![Docs](https://img.shields.io/badge/Docs-doc.aiputing.com%2Fdbm-2E8B57?style=flat-square)](https://doc.aiputing.com/dbm)
[![Live Demo](https://img.shields.io/badge/Demo-nddemo.aiputing.com-7B2FBE?style=flat-square)](http://nddemo.aiputing.com)

**English** ｜ [**中文**](README_zh.md)

---

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

Open <http://nddemo.aiputing.com> in your browser. To get a demo account, follow our WeChat official account (QR code below) and reply "nd".

<img src="https://www.aiputing.com/assets/img/winFactor.jpg" width="180" alt="WeChat official account QR code — reply 'nd' for a demo account" />

The demo environment is reset periodically — don't put real data in it.

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

## 📸 Screenshot TODO

> Remove this section once the assets are in place.

- [ ] Overview GIF: `img/demo-overview.gif` (≤ 15s: login → connect a database via the proxy → run SQL in the web editor → check the audit log → rollback a version)
- [ ] Scenario 1 screenshot: `img/scenario-audit.png` (session monitoring + SQL audit list + offline replay)
- [ ] Scenario 2 screenshot: `img/scenario-version.png` (version list + approval + one-click rollback)
- [ ] Scenario 3 screenshot: `img/scenario-ai.png` (AI SQL editor)
- [ ] Commit `demos/docker-compose.yml` (referenced by the quick-start command; not in the repo yet)
- [ ] The Actions badge assumes a `ci.yml` workflow — verify the filename once CI is enabled
- [ ] Replace the website link in License with the direct licensing page once it's ready
- [ ] If a fixed demo account (e.g. test / test) is desired, create it and update the Live Demo section
