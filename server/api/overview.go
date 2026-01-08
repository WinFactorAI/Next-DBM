package api

import (
	"context"
	"next-dbm/server/common/nd"
	"next-dbm/server/dto"
	"next-dbm/server/global/stat"
	"next-dbm/server/repository"
	"time"

	"github.com/labstack/echo/v4"
)

type OverviewApi struct{}

func (api OverviewApi) OverviewCounterEndPoint(c echo.Context) error {
	var (
		totalUser           int64
		onlineUser          int64
		constOnlineSession  int64
		countOfflineSession int64
		totalAsset          int64
		activeAsset         int64
		failLoginCount      int64
		totalGit            int64
		totalBuild          int64
		buildFailCount      int64
		buildSuccessCount   int64
		totalSensitive      int64
		totalSensitiveGroup int64
		totalTrigger        int64
		totalTriggerGroup   int64
		totalProxy          int64
		totalSqlLog         int64
		sqlLogSuccessCount  int64
	)
	totalUser, _ = repository.UserRepository.Count(context.TODO())
	onlineUser, _ = repository.UserRepository.CountOnlineUser(context.TODO())
	constOnlineSession, _ = repository.SessionRepository.CountOnlineSession(context.TODO())
	countOfflineSession, _ = repository.SessionRepository.CountOfflineSession(context.TODO())
	totalAsset, _ = repository.AssetRepository.Count(context.TODO())
	activeAsset, _ = repository.AssetRepository.CountByActive(context.TODO(), true)
	failLoginCount, _ = repository.LoginLogRepository.CountByState(context.TODO(), "0")
	totalGit = 0
	totalBuild = 0
	buildFailCount = 0
	buildSuccessCount = 0
	totalSensitive = 0
	totalSensitiveGroup = 0
	totalTrigger = 0
	totalTriggerGroup = 0
	totalProxy = 0
	totalSqlLog, _ = repository.SqlLogRepository.Count(context.TODO())
	sqlLogSuccessCount, _ = repository.SqlLogRepository.CountByState(context.TODO(), "0")

	counter := dto.Counter{
		TotalUser:           totalUser,
		OnlineUser:          onlineUser,
		OnlineSession:       constOnlineSession,
		OfflineSession:      countOfflineSession,
		TotalAsset:          totalAsset,
		ActiveAsset:         activeAsset,
		FailLoginCount:      failLoginCount,
		TotalGit:            totalGit,
		TotalBuild:          totalBuild,
		BuildFailCount:      buildFailCount,
		BuildSuccessCount:   buildSuccessCount,
		TotalSensitive:      totalSensitive,
		TotalSensitiveGroup: totalSensitiveGroup,
		TotalTrigger:        totalTrigger,
		TotalTriggerGroup:   totalTriggerGroup,
		TotalProxy:          totalProxy,
		TotalSqlLog:         totalSqlLog,
		SqlLogSuccessCount:  sqlLogSuccessCount,
	}

	return Success(c, counter)
}

func (api OverviewApi) OverviewAssetEndPoint(c echo.Context) error {
	var (
		mysql      int64
		mariadb    int64
		redis      int64
		mongodb    int64
		sqlserver  int64
		oracle     int64
		postgresql int64
		sqlite     int64
	)
	mysql, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.MySQL)
	mariadb, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.MariaDB)
	postgresql, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.PostgreSQL)
	oracle, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.Oracle)
	redis, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.Redis)
	mongodb, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.MongoDB)
	sqlserver, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.SqlServer)

	sqlite, _ = repository.AssetRepository.CountByProtocol(context.TODO(), nd.SQLite)

	m := echo.Map{
		"mysql":      mysql,
		"mariadb":    mariadb,
		"postgresql": postgresql,
		"oracle":     oracle,
		"redis":      redis,
		"mongodb":    mongodb,
		"sqlserver":  sqlserver,

		"sqlite": sqlite,
		"all":    mysql + redis + mongodb + sqlserver + postgresql + sqlite,
	}
	return Success(c, m)
}

func (api OverviewApi) OverviewDateCounterEndPoint(c echo.Context) error {
	d := c.QueryParam("d")
	var days = 7
	if d == "month" {
		days = 30
	}
	now := time.Now()
	lastDate := now.AddDate(0, 0, -days)
	// 最近一月登录次数
	loginLogCounters, err := repository.LoginLogRepository.CountWithGroupByLoginTime(context.TODO(), lastDate)
	if err != nil {
		return err
	}
	// 最近一月活跃用户
	userCounters, err := repository.LoginLogRepository.CountWithGroupByLoginTimeAndUsername(context.TODO(), lastDate)
	if err != nil {
		return err
	}
	// 最近一月活跃资产
	sessionCounters, err := repository.SessionRepository.CountWithGroupByLoginTime(context.TODO(), lastDate)
	if err != nil {
		return err
	}

	var counters []dto.DateCounter
	for i := 0; i < days; i++ {
		day := lastDate.AddDate(0, 0, i).Format("2006-01-02")

		var exist = false
		for _, counter := range loginLogCounters {
			if counter.Date == day {
				exist = true
				counters = append(counters, dto.DateCounter{
					Type:  "dashboard.login_count",
					Date:  day,
					Value: counter.Value,
				})
				break
			}
		}

		if !exist {
			counters = append(counters, dto.DateCounter{
				Type:  "dashboard.login_count",
				Date:  day,
				Value: 0,
			})
		}

		exist = false
		for _, counter := range userCounters {
			if counter.Date == day {
				exist = true
				counters = append(counters, dto.DateCounter{
					Type:  "dashboard.active_users",
					Date:  day,
					Value: counter.Value,
				})
				break
			}
		}

		if !exist {
			counters = append(counters, dto.DateCounter{
				Type:  "dashboard.active_users",
				Date:  day,
				Value: 0,
			})
		}

		exist = false
		for _, counter := range sessionCounters {
			if counter.Date == day {
				exist = true
				counters = append(counters, dto.DateCounter{
					Type:  "dashboard.active_assets",
					Date:  day,
					Value: counter.Value,
				})
				break
			}
		}

		if !exist {
			counters = append(counters, dto.DateCounter{
				Type:  "dashboard.active_assets",
				Date:  day,
				Value: 0,
			})
		}
	}

	return Success(c, counters)
}

func (api OverviewApi) OverviewPS(c echo.Context) error {

	return Success(c, stat.SystemLoad)
}
