package env

import (
	"fmt"
	"next-dbm/server/common/data"
	"next-dbm/server/config"
	"next-dbm/server/model"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func setupDB() *gorm.DB {

	var logMode logger.Interface
	if config.GlobalCfg.Debug {
		logMode = logger.Default.LogMode(logger.Info)
	} else {
		logMode = logger.Default.LogMode(logger.Silent)
	}

	fmt.Printf("当前数据库模式为：%v\n", config.GlobalCfg.DB)
	var err error
	var db *gorm.DB
	if config.GlobalCfg.DB == "mysql" {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&timeout=60s",
			config.GlobalCfg.Mysql.Username,
			config.GlobalCfg.Mysql.Password,
			config.GlobalCfg.Mysql.Hostname,
			config.GlobalCfg.Mysql.Port,
			config.GlobalCfg.Mysql.Database,
		)
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logMode,
		})
	} else {
		dsn := fmt.Sprintf("file:%s?cache=shared&mode=rwc", config.GlobalCfg.Sqlite.File)
		db, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{
			Logger:                 logMode,
			SkipDefaultTransaction: true,
		})
	}

	if err != nil {
		panic(fmt.Errorf("连接数据库异常: %v", err.Error()))
	}

	if err := db.AutoMigrate(
		&model.User{}, &model.Asset{}, &model.AssetAttribute{}, &model.Session{}, &model.Command{},
		&model.Credential{}, &model.Property{}, &model.UserGroup{}, &model.UserGroupMember{},
		&model.LoginLog{}, &model.Job{}, &model.JobLog{}, &model.AccessSecurity{}, &model.AccessGateway{},
		&model.Storage{}, &model.Strategy{},
		&model.AccessToken{}, &model.ShareSession{},
		&model.Role{}, &model.RoleMenuRef{}, &model.UserRoleRef{},
		&model.LoginPolicy{}, &model.LoginPolicyUserRef{}, &model.TimePeriod{},
		&model.StorageLog{}, &model.Authorised{},
		&model.Sqls{},
		&model.OperLog{}, &model.SqlLog{},

		&model.Translations{},
	); err != nil {
		panic(fmt.Errorf("初始化数据库表结构异常: %v", err.Error()))
	}

	// 初始化数据
	var jobCount int64
	if err := db.Model(&model.Job{}).Count(&jobCount).Error; err != nil {
		panic(fmt.Errorf("查询数据时发生错误: %v", err.Error()))
	}

	if jobCount == 0 {
		fmt.Println("jobCount 表为空")
		jobs := data.InitJob()
		// 批量更新
		if err := db.Save(&jobs).Error; err != nil {
			panic(fmt.Errorf("批量更新数据时发生错误: %v", err.Error()))
		}
	} else {
		// fmt.Println("jobCount 表不为空")
	}

	var userGroupCount int64
	if err := db.Model(&model.UserGroup{}).Count(&userGroupCount).Error; err != nil {
		panic(fmt.Errorf("查询数据时发生错误: %v", err.Error()))
	}

	if userGroupCount == 0 {
		fmt.Println("userGroupCount 表为空")
		jobs := data.InitUserGroup()
		// 批量更新
		if err := db.Save(&jobs).Error; err != nil {
			panic(fmt.Errorf("批量更新数据时发生错误: %v", err.Error()))
		}
	} else {
		// fmt.Println("userGroupCount 表不为空")
	}

	var i18nCount int64
	if err := db.Model(&model.Translations{}).Count(&i18nCount).Error; err != nil {
		panic(fmt.Errorf("查询数据时发生错误: %v", err.Error()))
	}

	if i18nCount == 0 {
		fmt.Println("i18nCount 表为空")
		i18ns := data.InitI18N()
		// 批量更新
		if err := db.Save(&i18ns).Error; err != nil {
			panic(fmt.Errorf("批量更新数据时发生错误: %v", err.Error()))
		}
	} else {
		// fmt.Println("i18nCount 表不为空")
	}
	return db
}
