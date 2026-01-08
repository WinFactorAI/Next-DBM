package repository

import (
	"context"
	"os"
	"path"
	"time"

	"next-dbm/server/config"
	"next-dbm/server/log"
	"next-dbm/server/model"
	"next-dbm/server/utils"
)

var BuildLogRepository = new(buildManagerLogRepository)

type buildManagerLogRepository struct {
	baseRepository
}

func (r buildManagerLogRepository) Find(c context.Context, pageIndex, pageSize int, name, content, order, field string, buildId string) (o []model.BuildLogForPage, total int64, err error) {
	db := r.GetDB(c).Table("build_log").Select("build_log.id,build_log.name,build_log.content,build_log.owner,build_log.created, users.nickname as owner_name, build_log.status ").Joins("left join users on build_log.owner = users.id").Group("build_log.id")
	dbCounter := r.GetDB(c).Table("build_log")

	if len(name) > 0 {
		db = db.Where("build_log.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("build_log.name like ?", "%"+name+"%")
	}

	if len(content) > 0 {
		db = db.Where("build_log.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("build_log.content like ?", "%"+content+"%")
	}
	if len(buildId) > 0 {
		db = db.Where("build_log.build_id = ?", buildId)
		dbCounter = dbCounter.Where("build_log.build_id = ?", buildId)
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	if order == "ascend" {
		order = "asc"
	} else {
		order = "desc"
	}

	if field == "name" {
		field = "name"
	} else {
		field = "created"
	}

	err = db.Order("build_log." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildLogForPage, 0)
	}
	return
}

func (r buildManagerLogRepository) WorkerFind(c context.Context, pageIndex, pageSize int, name, content, order, field, userId string) (o []model.BuildLogForPage, total int64, err error) {
	db := r.GetDB(c).Table("Build").Select("build_log.id,build_log.name,build_log.content,build_log.owner,build_log.created,build_log.status").Where("build_log.owner = ?", userId)
	dbCounter := r.GetDB(c).Table("Build").Where("build_log.owner = ?", userId)

	if len(name) > 0 {
		db = db.Where("build_log.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("build_log.name like ?", "%"+name+"%")
	}

	if len(content) > 0 {
		db = db.Where("build_log.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("build_log.content like ?", "%"+content+"%")
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	if order == "ascend" {
		order = "asc"
	} else {
		order = "desc"
	}

	if field == "name" {
		field = "name"
	} else {
		field = "created"
	}

	err = db.Order("build_log." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildLogForPage, 0)
	}
	return
}

func (r buildManagerLogRepository) Create(c context.Context, o *model.BuildLog) (err error) {
	if err = r.GetDB(c).Create(o).Error; err != nil {
		return err
	}
	// 将结构体转换为 JSON 字符串
	// 获取基本目录
	drivePath := config.GlobalCfg.Guacd.Build
	log.Info("drivePath:", log.String("drivePath", drivePath))

	// 判断文件夹不存在时自动创建
	dir := path.Join(drivePath, o.ID)
	if !utils.FileExists(dir) {
		if err := os.MkdirAll(dir, os.ModePerm); err != nil {
			return err
		}
	}
	//创建构建路径
	log.Info(" ## dir: ", log.String("dir", dir)) // 打印 JSON 格式的结构体内容

	return nil
}

func (r buildManagerLogRepository) FindById(c context.Context, id string) (o model.BuildLog, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r buildManagerLogRepository) UpdateById(c context.Context, o *model.BuildLog, id string) error {
	o.ID = id
	return r.GetDB(c).Updates(o).Error
}

func (r buildManagerLogRepository) DeleteById(c context.Context, id string) error {
	// 获取基本目录
	drivePath := config.GlobalCfg.Guacd.Build
	log.Info("drivePath:", log.String("drivePath", drivePath))

	// 判断文件夹不存在时自动创建
	dir := path.Join(drivePath, id)
	// 判断文件夹是否存在，存在则删除
	if utils.FileExists(dir) {
		log.Info("目录存在，准备删除: ", log.String("err", dir))

		// 删除目录及其子目录
		if err := os.RemoveAll(dir); err != nil {
			log.Error("删除目录失败:", log.NamedError("err", err))
			return err
		}
		log.Info("目录删除成功: ", log.String("dir", dir))
	} else {
		log.Info("目录不存在: ", log.String("dir", dir))
	}

	return r.GetDB(c).Where("id = ?", id).Delete(&model.BuildLog{}).Error
}

func (r buildManagerLogRepository) FindAll(c context.Context) (o []model.BuildLog, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r buildManagerLogRepository) FindByUserId(c context.Context, userId string) (o []model.BuildLog, err error) {
	err = r.GetDB(c).Where("owner = ?", userId).Find(&o).Error
	return
}

func (r buildManagerLogRepository) FindOutTimeLog(c context.Context, dayLimit int) (o []model.OperLog, err error) {
	created := time.Now().Add(time.Duration(-dayLimit*24) * time.Hour)
	err = r.GetDB(c).Where("(state = 'successSvg' and created < ?) or (state = 'failedSvg' and created < ?) or (state ='stopSvg' null and created < ?)", created, created, created).Find(&o).Error
	return
}
