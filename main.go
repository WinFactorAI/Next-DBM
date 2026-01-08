package main

import (
	"bufio"
	"fmt"
	"log"
	"next-dbm/server/app"
	"next-dbm/server/branding"
	"next-dbm/server/config"
	"next-dbm/server/resource"
	"next-dbm/server/utils"
	"os"
	"strings"
)

func printHelp() {
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("Next-DBM 数据库审计系统 - 使用说明")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("")
	fmt.Println("命令:")
	fmt.Println("  version    - 显示版本信息")
	fmt.Println("  help    - 显示本帮助信息")
	fmt.Println("  init    - 初始化项目（创建配置文件和静态资源）")
	fmt.Println("  upgrade  - 更新静态资源文件")
	fmt.Println("")
	fmt.Println("示例:")
	fmt.Println("  初始化项目: next-dbm init")
	// fmt.Println("  运行服务:   next-dbm run --port 9000 --config ./my-config.yml")
	fmt.Println("  更新资源:   next-dbm upgrade")
	fmt.Println("")
	fmt.Println("提示:")
	fmt.Println("  • 执行 'init' 命令将覆盖现有的配置文件!")
	fmt.Println("  • 使用 --help 查看本帮助: next-dbm --help")
	fmt.Println(strings.Repeat("=", 60))
}

func main() {

	if len(os.Args) > 1 {
		args := os.Args[1:]

		switch args[0] {
		case "help":
			fmt.Println(branding.Help)
			printHelp()
			os.Exit(0)
		case "init":
			fmt.Println("这将覆盖现有的配置文件和静态资源，您确定要继续吗？(Y/N)")
			reader := bufio.NewReader(os.Stdin)
			confirmation, err := reader.ReadString('\n')
			if err != nil {
				fmt.Println("读取输入错误:", err)
				os.Exit(1)
			}

			// 清理输入并转换大写
			confirmation = strings.TrimSpace(strings.ToUpper(confirmation))
			if confirmation == "Y" {
				fmt.Println("正在执行初始化...")
				utils.ExportPackage(resource.Resource, "dist", "web/dist")
				utils.ExportPackage(resource.Resource, "config.yml", "config.yml")
			} else {
				fmt.Println("已取消初始化操作")
				os.Exit(0)
			}
			os.Exit(0)
		case "upgrade":
			utils.ExportPackage(resource.Resource, "dist", "web/dist")
			if config.GlobalCfg.Docker {
				os.Exit(0)
			}
		case "version":
			fmt.Println(branding.Version)
			os.Exit(0)
		default:
			fmt.Printf("未知命令: %s\n", args[0])
			os.Exit(1)
		}
	}

	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
