package repository

import (
	"context"
	"os"
	"path"

	"next-dbm/server/config"
	"next-dbm/server/log"
	"next-dbm/server/model"
	"next-dbm/server/utils"
)

var BuildTriggerRepository = new(buildTriggerRepository)

type buildTriggerRepository struct {
	baseRepository
}

func (r buildTriggerRepository) Find(c context.Context, pageIndex, pageSize int, buildId, content, classType, order, field string) (o []model.BuildTriggerForPage, total int64, err error) {
	db := r.GetDB(c).Table("build_trigger").Select("build_trigger.id,build_trigger.webhook_url,build_trigger.trigger,build_trigger.attr,build_trigger.secre_token,build_trigger.secre_token,build_trigger.owner,build_trigger.created, users.nickname as owner_name, build_trigger.status as status").
		Joins("left join users on build_trigger.owner = users.id").
		Group("build_trigger.id")
	dbCounter := r.GetDB(c).Table("build_trigger")

	if len(buildId) > 0 {
		db = db.Where("build_trigger.build_id = ?", buildId)
		dbCounter = dbCounter.Where("build_trigger.build_id = ?", buildId)
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

	err = db.Order("build_trigger." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildTriggerForPage, 0)
	}
	return
}

func (r buildTriggerRepository) WorkerFind(c context.Context, pageIndex, pageSize int, name, content, classType, order, field, userId string) (o []model.BuildTriggerForPage, total int64, err error) {
	db := r.GetDB(c).Table("build_trigger").Select("build_trigger.id,build_trigger.owner,build_trigger.created").Where("build_trigger.owner = ?", userId)
	dbCounter := r.GetDB(c).Table("build_trigger").Where("build_trigger.owner = ?", userId)

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

	err = db.Order("build_trigger." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildTriggerForPage, 0)
	}
	return
}

func (r buildTriggerRepository) Create(c context.Context, o *model.BuildTrigger) (err error) {
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

func (r buildTriggerRepository) FindById(c context.Context, id string) (o model.BuildTrigger, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r buildTriggerRepository) FindByClassType(c context.Context, classType string) (o []model.BuildTrigger, err error) {
	err = r.GetDB(c).Where("class_type = ?", classType).Find(&o).Error
	return
}

func (r buildTriggerRepository) UpdateById(c context.Context, o *model.BuildTrigger, id string) error {
	o.ID = id
	return r.GetDB(c).Updates(o).Error
}

func (r buildTriggerRepository) DeleteById(c context.Context, id string) error {
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

	return r.GetDB(c).Where("id = ?", id).Delete(&model.BuildTrigger{}).Error
}

func (r buildTriggerRepository) FindAll(c context.Context) (o []model.BuildTrigger, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r buildTriggerRepository) FindByUserId(c context.Context, userId string) (o []model.BuildTrigger, err error) {
	err = r.GetDB(c).Where("owner = ?", userId).Find(&o).Error
	return
}

func (r buildTriggerRepository) FindByBuildId(c context.Context, buildId string) (o []model.BuildTrigger, err error) {
	err = r.GetDB(c).Where("build_id = ?", buildId).Find(&o).Error
	return
}
func (r buildTriggerRepository) DeleteByBuildId(c context.Context, buildId string) error {
	return r.GetDB(c).Where("build_id = ?", buildId).Delete(&model.BuildTrigger{}).Error
}

func (r buildTriggerRepository) FindByBuildIdAndSecreToken(c context.Context, buildId string, secreToken string) (o model.BuildTrigger, err error) {
	err = r.GetDB(c).Where("build_id = ? and secre_token = ?", buildId, secreToken).Find(&o).Error
	return
}
