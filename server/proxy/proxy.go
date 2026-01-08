package proxy

import (
	"context"
	"fmt"
	"net"
	"next-dbm/server/common/nd"
	"next-dbm/server/global/cache"
	"next-dbm/server/global/security"
	"next-dbm/server/log"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"
	"strings"
	"sync"
	"time"

	"github.com/pingcap/errors"
	"go.uber.org/zap"
)

var Proxy *proxy

type proxy struct {
	MariaDBProxy *MariaDBProxy

	// RedisProxy     *RedisProxy
	// MongoProxy     *MongoProxy
}

func init() {
	Proxy = &proxy{}
}

func Reload() {

	if Proxy.MariaDBProxy != nil {
		Proxy.MariaDBProxy.ReloadMariaDBProxy()
	}

}

func CheckUserNameAuth(username string, assetProtocol string) (bool, error) {
	var isUsername bool
	var err error // 统一错误变量声明

	log.Info("assetProtocol "+assetProtocol, zap.String("protocol", assetProtocol))

	switch assetProtocol {

	case nd.MariaDB:
		if Proxy.MariaDBProxy == nil || Proxy.MariaDBProxy.listener == nil {
			return false, fmt.Errorf("未开启MariaDB代理服务")
		}
		log.Info("CheckUserNameAuth MariaDB", zap.String("username", username))
		isUsername, err = Proxy.MariaDBProxy.CheckUserName(username)
		if err != nil {
			log.Error("CheckUserNameAuth error", zap.Error(err))
			return false, err
		}

	default:
		return false, fmt.Errorf("不支持的协议类型: %s", assetProtocol)
	}

	log.Info("isUsername check result", zap.Bool("isUsername", isUsername))
	if isUsername {
		log.Info("CheckUserNameAuth success", zap.String("username", username))
		return true, nil
	}

	return false, fmt.Errorf("用户 %s 没有权限,需要授权用户后重试", username)
}

var proxyMu sync.Mutex // 可选：防止并发更新冲突

// ProxyUpdateServer 更新或关闭数据库代理
func ProxyUpdateServer(types string, proxyx interface{}) {
	proxyMu.Lock()
	defer proxyMu.Unlock()

	switch types {

	case "MariaDB":
		if proxyx == nil {
			log.Info("MariaDB proxy closed")
			Proxy.MariaDBProxy = nil
			return
		}
		if v, ok := proxyx.(*MariaDBProxy); ok {
			Proxy.MariaDBProxy = v
			log.Info("MariaDB proxy updated", zap.Any("proxy", v))
		} else {
			log.Warn("Invalid MariaDB proxy type", zap.Any("input", proxyx))
		}

	default:
		log.Warn("Unknown proxy type", zap.String("type", types))
	}
}
func (proxy proxy) Serve() []string {
	var logs []string

	fmt.Printf("⇨ proxy server \n")
	logs = append(logs, "⇨ proxy server")

	// MariaDB
	if value, _ := cache.PropertyManager.Get("enable-auto-start-mariadb"); value == "true" {
		port, _ := cache.PropertyManager.Get("mariadb-proxy-port")
		fmt.Printf("\t mariadb proxy server started on %v\n", port)
		logs = append(logs, fmt.Sprintf("\t mariadb proxy server started on %v", port))
		go func() {
			Proxy.MariaDBProxy = NewMariaDBProxy(port.(string))
			Proxy.MariaDBProxy.InitAuth()
			if err := Proxy.MariaDBProxy.Start(); err != nil {
				fmt.Printf("⇨ mariadb-db proxy server start failed: %v\n", err.Error())
			}
		}()
	}

	return logs // 返回日志切片
}

func getRemoteIP(conn net.Conn) string {
	if conn == nil {
		return ""
	}

	addr := conn.RemoteAddr()
	if addr == nil {
		return ""
	}

	host, _, err := net.SplitHostPort(addr.String())
	if err != nil {
		// 极端情况：没有端口，直接返回原字符串
		return addr.String()
	}

	// IPv6 可能是 "[::1]"，去掉中括号
	return strings.Trim(host, "[]")
}
func allowIP(ip string) (bool, string) {
	securities := security.GlobalSecurityManager.Values()
	if len(securities) == 0 {
		return true, ""
	}

	for _, s := range securities {
		match := false

		if strings.Contains(s.IP, "/") {
			// CIDR
			_, ipNet, err := net.ParseCIDR(s.IP)
			if err == nil && ipNet.Contains(net.ParseIP(ip)) {
				match = true
			}
		} else if strings.Contains(s.IP, "-") {
			// IP 范围
			split := strings.Split(s.IP, "-")
			if len(split) == 2 {
				req := utils.IpToInt(ip)
				if req >= utils.IpToInt(split[0]) &&
					req <= utils.IpToInt(split[1]) {
					match = true
				}
			}
		} else {
			// 单 IP
			if s.IP == ip {
				match = true
			}
		}

		if !match {
			continue
		}

		if s.Rule == nd.AccessRuleAllow {
			return true, ""
		}
		if s.Rule == nd.AccessRuleReject {
			return false, "your access request was denied :(\n"
		}
	}

	return true, ""
}

func loginPolicyCheck(userId, clientIp string) error {
	ctx := context.Background()
	// 按照优先级倒排进行查询
	policies, err := repository.LoginPolicyRepository.FindByUserId(ctx, userId)
	if err != nil {
		return err
	}
	if len(policies) == 0 {
		return nil
	}

	if err := checkClientIp(policies, clientIp); err != nil {
		return err
	}

	if err := checkWeekDay(policies); err != nil {
		return err
	}
	return nil
}

func checkClientIp(policies []model.LoginPolicy, clientIp string) error {
	var pass = true
	// 优先级低的先进行判断
	for _, policy := range policies {
		if !policy.Enabled {
			continue
		}
		ipGroups := strings.Split(policy.IpGroup, ",")
		for _, group := range ipGroups {
			if strings.Contains(group, "/") {
				// CIDR
				_, ipNet, err := net.ParseCIDR(group)
				if err != nil {
					continue
				}
				if !ipNet.Contains(net.ParseIP(clientIp)) {
					continue
				}
			} else if strings.Contains(group, "-") {
				// 范围段
				split := strings.Split(group, "-")
				if len(split) < 2 {
					continue
				}
				start := split[0]
				end := split[1]
				intReqIP := utils.IpToInt(clientIp)
				if intReqIP < utils.IpToInt(start) || intReqIP > utils.IpToInt(end) {
					continue
				}
			} else {
				// IP
				if group != clientIp {
					continue
				}
			}
			pass = policy.Rule == "allow"
		}
	}

	if !pass {
		return errors.New("非常抱歉，您当前使用的IP地址不允许进行登录。")
	}
	return nil
}

func checkWeekDay(policies []model.LoginPolicy) error {
	// 获取当前日期是星期几
	now := time.Now()
	weekday := int(now.Weekday())
	hwc := now.Format("15:04")

	var timePass = true

	// 优先级低的先进行判断
	for _, policy := range policies {
		if !policy.Enabled {
			continue
		}
		timePeriods, err := repository.TimePeriodRepository.FindByLoginPolicyId(context.Background(), policy.ID)
		if err != nil {
			return err
		}

		for _, period := range timePeriods {
			if weekday != period.Key {
				continue
			}
			if period.Value == "" {
				continue
			}
			// 只处理对应天的数据
			times := strings.Split(period.Value, "、")
			for _, t := range times {
				timeRange := strings.Split(t, "~")
				start := timeRange[0]
				end := timeRange[1]
				if (start == "00:00" && end == "00:00") || (start <= hwc && hwc <= end) {
					timePass = policy.Rule == "allow"
				}
			}
		}
	}

	if !timePass {
		return errors.New("非常抱歉，当前时段不允许您进行登录。")
	}

	return nil
}
