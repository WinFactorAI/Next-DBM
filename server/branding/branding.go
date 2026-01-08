package branding

import (
	"fmt"
	"time"
)

var Name = "Next-DBM"
var Copyright = fmt.Sprintf("Copyright ©  %d 北京胜利因子科技有限公司, All Rights Reserved.", time.Now().Year())
var Banner = `

███╗   ██╗ ███████╗ ██╗  ██╗ ████████╗        ██████╗  ██████╗  ███╗   ███╗
████╗  ██║ ██╔════╝ ╚██╗██╔╝ ╚══██╔══╝        ██╔══██╗ ██╔══██╗ ████╗ ████║
██╔██╗ ██║ █████╗    ╚███╔╝     ██║    █████╗ ██║  ██║ ██████╔╝ ██╔████╔██║
██║╚██╗██║ ██╔══╝    ██╔██╗     ██║    ╚════╝ ██║  ██║ ██╔══██╗ ██║╚██╔╝██║
██║ ╚████║ ███████╗ ██╔╝ ██╗    ██║           ██████╔╝ ██████╔╝ ██║ ╚═╝ ██║
╚═╝  ╚═══╝ ╚══════╝ ╚═╝  ╚═╝    ╚═╝           ╚═════╝  ╚═════╝  ╚═╝     ╚═╝
`
var Version = `v1.5.5`
var Hi = Banner + Version
var Help = `
Licenses: https://licenses.aiputing.com
Forums: https://wx.zsxq.com/group/51111845851884
Email: support@aiputing.com
`

var CheckVersionUrl = "http://f.aiputing.com/raw/Next-DBM/version.json"

var Upgrade = `
版本说明 - NextDBM-Pro - 版本 1.5.5

** 任务
    * [DBMPRO-251] - 完善DBEditor编辑器状态功能
    * [DBMPRO-252] - 获取PostgreSQL数据库版本等信息在状态栏中显示
    * [DBMPRO-254] - 完善树形菜单图标
    * [DBMPRO-255] - 添加ER图模型设计模块

** 故事
    * [DBMPRO-76] - 左侧树形-能够创建数据库
    * [DBMPRO-86] - SQL指令需要支持获取指令库信息
    * [DBMPRO-77] - 左侧树形-查询表
    * [DBMPRO-140] - 全部DB资产管理工具。支持库表比对功能。
    * [DBMPRO-72] - 支持单表筛选器功能
    * [DBMPRO-75] - 左侧树形-查询数据库列表
    * [DBMPRO-71] - 支持多库对表对比

** 故障
    * [DBMPRO-253] - 修复SQL脚本管理回显示数据库名没有默认回显示问题



`
