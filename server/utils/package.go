package utils

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
)

func ExportPackage(binFS embed.FS, sourcePath, targetPath string) {
	// 强制清理目标路径（文件或目录）
	if err := os.RemoveAll(targetPath); err != nil && !os.IsNotExist(err) {
		log.Fatalf("清理旧路径失败: %v", err)
	}

	// 判断嵌入路径是文件还是目录
	fileInfo, err := fs.Stat(binFS, sourcePath)
	if err != nil {
		log.Fatalf("检查嵌入路径失败: %v", err)
	}

	if fileInfo.IsDir() {
		// 处理目录
		err := fs.WalkDir(binFS, sourcePath, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}

			relPath, _ := filepath.Rel(sourcePath, path)
			currentTarget := filepath.Join(targetPath, relPath)

			if d.IsDir() {
				return os.MkdirAll(currentTarget, 0755)
			}

			data, _ := binFS.ReadFile(path)
			return os.WriteFile(currentTarget, data, getFileMode(path))
		})
		if err != nil {
			log.Fatalf("解压目录失败: %v", err)
		}
	} else {
		// 处理单个文件
		data, _ := binFS.ReadFile(sourcePath)
		if err := os.MkdirAll(filepath.Dir(targetPath), 0755); err != nil {
			log.Fatalf("创建父目录失败: %v", err)
		}
		if err := os.WriteFile(targetPath, data, getFileMode(sourcePath)); err != nil {
			log.Fatalf("写入文件失败: %v", err)
		}
	}

	fmt.Printf("[%s → %s] 解压成功\n", sourcePath, targetPath)
}

// 根据文件扩展名设置权限（可扩展）
func getFileMode(path string) os.FileMode {
	switch filepath.Ext(path) {
	case ".sh", ".exe", ".bat", ".bin":
		return 0755 // 可执行文件
	default:
		return 0644 // 普通文件
	}
}
