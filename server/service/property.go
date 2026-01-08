package service

import (
	"context"
	"errors"
	"fmt"
	"next-dbm/server/branding"
	"next-dbm/server/common/guacamole"
	"next-dbm/server/config"
	"next-dbm/server/env"
	"next-dbm/server/global/cache"
	"next-dbm/server/log"
	"next-dbm/server/model"
	"next-dbm/server/proxy"
	"next-dbm/server/repository"
	"next-dbm/server/utils"
	"os"
	"regexp"
	"strings"
	"sync"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

var PropertyService = new(propertyService)

type propertyService struct {
	baseService
}

var deprecatedPropertyNames = []string{
	guacamole.EnableDrive,
	guacamole.DrivePath,
	guacamole.DriveName,
	guacamole.DisableGlyphCaching,
	guacamole.CreateRecordingPath,
}

var defaultProperties = map[string]string{
	guacamole.EnableRecording:          "true",
	guacamole.FontName:                 "menlo",
	guacamole.FontSize:                 "12",
	guacamole.ColorScheme:              "gray-black",
	guacamole.EnableWallpaper:          "true",
	guacamole.EnableTheming:            "true",
	guacamole.EnableFontSmoothing:      "true",
	guacamole.EnableFullWindowDrag:     "true",
	guacamole.EnableDesktopComposition: "true",
	guacamole.EnableMenuAnimations:     "true",
	guacamole.DisableBitmapCaching:     "false",
	guacamole.DisableOffscreenCaching:  "false",
	"cron-log-saved-limit":             "360",
	"login-log-saved-limit":            "360",
	"session-saved-limit":              "360",
	"user-default-storage-size":        "5120",
	"default-language":                 "zh-CN",
	"default-theme":                    "default",
}

func (service propertyService) InitProperties() error {
	propertyMap := repository.PropertyRepository.FindAllMap(context.TODO())

	for name, value := range defaultProperties {
		if err := service.CreateIfAbsent(propertyMap, name, value); err != nil {
			return err
		}
	}

	return nil
}

func (service propertyService) CreateIfAbsent(propertyMap map[string]string, name, value string) error {
	if len(propertyMap[name]) == 0 {
		property := model.Property{
			Name:  name,
			Value: value,
		}
		return repository.PropertyRepository.Create(context.TODO(), &property)
	}
	return nil
}

func (service propertyService) DeleteDeprecatedProperty() error {
	propertyMap := repository.PropertyRepository.FindAllMap(context.TODO())
	for _, name := range deprecatedPropertyNames {
		if propertyMap[name] == "" {
			continue
		}
		if err := repository.PropertyRepository.DeleteByName(context.TODO(), name); err != nil {
			return err
		}
	}
	return nil
}

func (service propertyService) Update(item map[string]interface{}) error {
	return env.GetDB().Transaction(func(tx *gorm.DB) error {
		c := service.Context(tx)
		for key := range item {
			value := fmt.Sprintf("%v", item[key])
			if value == "" {
				value = "-"
			}

			property := model.Property{
				Name:  key,
				Value: value,
			}

			if key == "enable-ldap" && value == "false" {
				if err := UserService.DeleteALlLdapUser(c); err != nil {
					return err
				}
			}

			var keyPattern = regexp.MustCompile(`enable-auto-start-|.*-proxy-port`)
			if keyPattern.MatchString(key) {
				log.Info("Reload properties update cache", log.Any("key", key), log.Any("value", value))
				cache.PropertyManager.Set(key, value, cache.NoExpiration)
			}

			_, err := repository.PropertyRepository.FindByName(c, key)
			if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
				if err := repository.PropertyRepository.Create(c, &property); err != nil {
					return err
				}
			} else {
				if err := repository.PropertyRepository.UpdateByName(c, &property, key); err != nil {
					return err
				}
			}
		}
		return nil
	})

}

func (service propertyService) Reload() error {

	properties := repository.PropertyRepository.FindAllMap(context.TODO())
	log.Info("Reload properties", log.Any("properties", properties))

	// cache.PropertyManager.Set("enable-auto-start-mysql", properties["enable-auto-start-mysql"], cache.NoExpiration)
	// cache.PropertyManager.Set("mysql-proxy-port", properties["mysql-proxy-port"], cache.NoExpiration)

	// cache.PropertyManager.Set("enable-auto-start-redis", properties["enable-auto-start-redis"], cache.NoExpiration)
	// cache.PropertyManager.Set("redis-proxy-port", properties["redis-proxy-port"], cache.NoExpiration)

	// 定义需要匹配的键名特征
	targetPatterns := []string{"enable-auto-start-", "-proxy-port"}
	var updatedKeys []string

	// 加锁保证缓存更新的原子性（假设 cache.PropertyManager 无内置锁）

	// 遍历所有属性，按规则更新缓存
	for key, value := range properties {
		for _, pattern := range targetPatterns {
			if strings.Contains(key, pattern) {
				// 记录更新操作
				updatedKeys = append(updatedKeys, key)
				// 设置缓存（保持原有 NoExpiration 策略）
				cache.PropertyManager.Set(key, value, cache.NoExpiration)
				break // 匹配到任一特征即可停止检查
			}
		}
	}

	// 记录实际更新的键
	if len(updatedKeys) > 0 {
		log.Info("Reloaded cached properties",
			log.Int("count", len(updatedKeys)),
			log.Any("keys", updatedKeys))
	}
	return nil
}

func (service propertyService) RestartApp() (bool, error) {
	log.Info("Restarting application...")

	go func() {
		utils.RestartApplication()
	}()
	return true, nil
}
func (service propertyService) CheckAppStatus() (bool, error) {
	log.Info("Next-DBM runing application...")
	return true, nil
}

func (service propertyService) StopApp() (bool, error) {
	log.Info("Stoping application...")
	go utils.StopApplication()
	return true, nil
}

// 全局定义
var (
	isUpgrade = "no"       // 非导出变量（包内可访问）
	mu        sync.RWMutex // 保护全局变量的互斥锁
)

func SetUpgradeStatus(status string) {
	mu.Lock()
	defer mu.Unlock()
	isUpgrade = status
}

func GetUpgradeStatus() string {
	mu.RLock()
	defer mu.RUnlock()
	return isUpgrade
}

func (service propertyService) CheckNewVersion() (*model.VersionInfo, error) {
	vsion := &model.VersionInfo{}
	version, err := utils.ShouldUpdate()
	if err != nil {
		return nil, err
	}
	vsion.DownURL = version["downurl"]
	vsion.Version = version["version"]
	vsion.Detail = version["detailurl"]
	vsion.IsUpgrade = GetUpgradeStatus()
	// isUpgrade, _ := repository.PropertyRepository.FindByName(context.Background(), "upgrade")
	// vsion.IsUpgrade = isUpgrade.Value
	if vsion.Version == "" {
		vsion.Version = ""
	}
	needMigrate := utils.CompareVersions(vsion.Version, branding.Version)
	log.Info("needMigrate: ", log.Any("needMigrate", needMigrate))
	if needMigrate <= 0 {
		vsion.Version = ""
		return vsion, nil
	}

	return vsion, nil
}

func (service propertyService) UpgradeApp() error {

	go func() {
		SetUpgradeStatus("upgrading")
		err := utils.UpdateApplication(config.GlobalCfg.Docker)
		SetUpgradeStatus("finished")
		if err != nil {
			if err.Error() == "__RESTART_REQUIRED_" {

				os.Exit(150)
			} else {
				log.Error("升级失败", zap.Error(err))
			}
		}
	}()
	return nil
}
func (service propertyService) UpgradeFinishApp() error {
	// 升级完成更新状态
	upgrade := model.Property{
		Name:  "upgrade",
		Value: "upgradeFinish",
	}
	repository.PropertyRepository.UpdateByName(context.Background(), &upgrade, "upgrade")
	return nil
}

// Mysql

// MariaDB
func (service propertyService) GetMariaDBStatus() (bool, error) {
	return proxy.StatusMariaDBProxy(), nil
}
func (service propertyService) MariaDBStart(port string) (bool, error) {
	properties := repository.PropertyRepository.FindAllMap(context.TODO())
	// 如果 port 为空，则使用 properties["maria-db-proxy-port"]
	log.Info(" ## maria-db-proxy-port: " + port)
	if port == "" || port == "undefined" {
		port = properties["maria-db-proxy-port"]
		log.Info(" ## 获取配置 maria-db-proxy-port: " + port)
	}
	if port == "" {
		port = "3307"
		log.Info(" ## 系统默认 maria-db-proxy-port: " + port)
	}
	resultCh := make(chan struct {
		ok  bool
		err error
	})
	// 启动 MySQL 代理服务作为 Goroutine
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Error("Recovered from panic in StartMariaDBProxy", zap.Any("panic", r))
				resultCh <- struct {
					ok  bool
					err error
				}{false, fmt.Errorf("panic: %v", r)}
			}
		}()
		ok, err := proxy.StartMariaDBProxy(port)
		resultCh <- struct {
			ok  bool
			err error
		}{ok, err}
	}()
	res := <-resultCh
	return res.ok, res.err
}

func (service propertyService) MariaDBStop() (bool, error) {
	proxy.StopMariaDBProxy()
	return true, nil
}
