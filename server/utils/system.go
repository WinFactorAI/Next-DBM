package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"next-dbm/server/branding"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/inconshreveable/go-update"
	"go.uber.org/zap"
)

// shouldUpdate 检查是否需要更新
func ShouldUpdate() (map[string]string, error) {

	resp, err := http.Get(branding.CheckVersionUrl)
	if err != nil {
		fmt.Printf("failed to check for updates: %v", err.Error())
		return nil, nil
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		fmt.Printf("failed to download update: %v", err)
		return nil, err
	}
	// 解析 JSON 数据
	var updateInfo map[string]string
	err = json.NewDecoder(resp.Body).Decode(&updateInfo)
	if err != nil {
		fmt.Printf("failed to parse update info: %v\n", err)
		return nil, err
	}

	// 打印解析结果
	fmt.Printf("Latest version: %s\n", updateInfo["version"])
	fmt.Printf("Download URL: %s\n", updateInfo["downurl"])

	log.Println("Checking for updateInfo...", zap.Any("version", updateInfo["version"]))
	log.Println("Checking for updates...", zap.Any("version", branding.Version))
	// if branding.Version == updateInfo["Version"] {
	// 	log.Println("No updates available.")
	// 	return nil, nil // 不需要更新
	// }
	return updateInfo, nil // 假设需要更新
}

func UpdateApplication(isDocker bool) error {
	updateInfo, err := ShouldUpdate()
	if err != nil {
		log.Fatalf("Failed to check for updates: %v", err)
		return nil
	}
	if updateInfo == nil {
		log.Fatalf("No updates available.")
		return err
	}
	log.Println("UpdateInfo:", zap.Any("updateInfo", updateInfo))
	fmt.Println("\nUpdating application...")
	log.Println("Downloading downurl ", updateInfo["downurl"])
	log.Println("Downloading config.GlobalCfg.Docker ", isDocker)
	downurl := updateInfo["downurl"]
	if isDocker {
		downurl = strings.ReplaceAll(updateInfo["downurl"], "next-dbm", "docker/next-dbm")
	}
	log.Println("Downloading 格式化后 downurl ", downurl)
	// 下载并应用更新
	err = DoUpdateByUrl(downurl)
	if err != nil {
		log.Fatalf("Update failed: %v", err)
		return err
	}

	fmt.Println("\nUpdate successful! Restarting...")

	// 重启应用

	return UpgradeStartApplication()

}

// doUpdate 下载并应用更新
func DoUpdateByUrl(url string) error {
	// 请求新文件
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download update: %v", err)
	}
	defer resp.Body.Close()

	// 应用更新
	log.Println("DoUpdateByUrl 开始更新...")
	err = update.Apply(resp.Body, update.Options{})
	if err != nil {
		// 如果更新失败，尝试回滚
		if rerr := update.RollbackError(err); rerr != nil {
			log.Println("Failed to apply update:", err)
			return fmt.Errorf("failed to apply update and rollback: %v (rollback error: %v)", err, rerr)
		}
		log.Println("DoUpdateByUrl 更新失败，已回滚")
		return fmt.Errorf("failed to apply update: %v", err)
	}
	log.Println("DoUpdateByUrl 下载完成...")
	return nil
}

// doUpdate 从本地文件更新系统
func DoUpdateByPath(updateFilePath, targetPath string) error {
	// 打开更新文件
	file, err := os.Open(updateFilePath)
	if err != nil {
		return fmt.Errorf("failed to open update file: %v", err)
	}
	defer file.Close()

	// 应用更新
	err = update.Apply(file, update.Options{
		TargetPath: targetPath, // 指定目标路径
	})
	if err != nil {
		// 如果更新失败，尝试回滚
		if rerr := update.RollbackError(err); rerr != nil {
			return fmt.Errorf("failed to apply update and rollback: %v (rollback error: %v)", err, rerr)
		}
		return fmt.Errorf("failed to apply update: %v", err)
	}

	return nil
}
func UpgradeStartApplication() error {
	log.Println("Upgrading 等待 2 秒...")
	time.Sleep(2 * time.Second) // 等待 2 秒
	// 获取当前可执行文件路径
	executable, err := os.Executable()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %v", err)
	}

	args := os.Args[1:]
	// 检查是否已经包含 "upgrade" 参数
	alreadyHasUpgrade := false
	for _, arg := range args {
		if arg == "upgrade" {
			alreadyHasUpgrade = true
			break
		}
	}

	// 如果没有 upgrade 参数才添加
	if !alreadyHasUpgrade {
		args = append(args, "upgrade")
	}
	// 解析符号链接（如果有）
	realPath, err := filepath.EvalSymlinks(executable)
	if err != nil {
		// 如果解析出错，使用原始路径
		realPath = executable
	}

	// 获取目录路径
	dir := filepath.Dir(realPath)
	log.Println("Upgrading 启动参数:", zap.Any("dir", dir), zap.Any("args", args))
	// 启动新的进程
	cmd := exec.Command("./next-dbm", args...)
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	// 设置进程属性（仅适用于 Unix 系统）
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setpgid: true, // 确保新进程独立于当前进程组
	}

	// 启动新进程
	log.Println("Upgrading 启动新进程...")
	if err := cmd.Start(); err != nil {
		log.Fatal("启动新进程失败:", zap.Any("error", err))
		return fmt.Errorf("failed to start new process: %v", err)
	}

	log.Println("Upgrading 退出当前进程...")
	return fmt.Errorf("__RESTART_REQUIRED_")
}

// restartApplication 重启应用
func RestartApplication() error {
	time.Sleep(2 * time.Second) // 等待 2 秒
	// 获取当前可执行文件路径
	executable, err := os.Executable()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %v", err)
	}
	exePath, err := filepath.EvalSymlinks(executable)
	if err != nil {
		panic(err)
	}
	log.Println("重启 :", zap.Any("exePath", exePath))
	// 启动新的进程
	cmd := exec.Command(exePath, os.Args[1:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	// 启动新进程
	if err := cmd.Start(); err != nil {
		log.Fatal("重启失败:", zap.Any("error", err))
		return fmt.Errorf("failed to start new process: %v", err)
	}

	// 退出当前进程
	os.Exit(150)
	log.Println("重启 : 退出当前进程...")
	return nil

}

func StopApplication() {
	time.Sleep(5 * time.Second) // 等待 2 秒
	os.Exit(0)
}
