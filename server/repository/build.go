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

var BuildRepository = new(buildManagerRepository)

type buildManagerRepository struct {
	baseRepository
}

func (r buildManagerRepository) Find(c context.Context, pageIndex, pageSize int, name, content, order, field string) (o []model.BuildForPage, total int64, err error) {
	db := r.GetDB(c).Table("build").Select("build.id,build.name,build.content,build.owner,build.created, users.nickname as owner_name,build.en_name ,build.git_id,build.status").
		Joins("left join users on build.owner = users.id").
		Group("build.id")
	dbCounter := r.GetDB(c).Table("build")

	if len(name) > 0 {
		db = db.Where("build.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("build.name like ?", "%"+name+"%")
	}

	if len(content) > 0 {
		db = db.Where("build.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("build.content like ?", "%"+content+"%")
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

	err = db.Order("build." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildForPage, 0)
	}
	return
}

func (r buildManagerRepository) WorkerFind(c context.Context, pageIndex, pageSize int, name, content, order, field, userId string) (o []model.BuildForPage, total int64, err error) {
	db := r.GetDB(c).Table("build").Select("build.id,build.name,build.content,build.owner,build.created,build.status").Where("build.owner = ?", userId)
	dbCounter := r.GetDB(c).Table("build").Where("build.owner = ?", userId)

	if len(name) > 0 {
		db = db.Where("build.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("build.name like ?", "%"+name+"%")
	}

	if len(content) > 0 {
		db = db.Where("build.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("build.content like ?", "%"+content+"%")
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

	err = db.Order("build." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildForPage, 0)
	}
	return
}

func (r buildManagerRepository) Create(c context.Context, o *model.Build) (err error) {
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

func (r buildManagerRepository) FindById(c context.Context, id string) (o model.Build, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r buildManagerRepository) FindByEnName(c context.Context, enname string) (o model.Build, err error) {
	err = r.GetDB(c).Where("en_name = ?", enname).First(&o).Error
	return
}

func (r buildManagerRepository) UpdateById(c context.Context, o *model.Build, id string) error {
	o.ID = id
	return r.GetDB(c).Updates(o).Error
}

func (r buildManagerRepository) DeleteById(c context.Context, id string) error {
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

	return r.GetDB(c).Where("id = ?", id).Delete(&model.Build{}).Error
}

func (r buildManagerRepository) Count(c context.Context) (total int64, err error) {
	err = r.GetDB(c).Find(&model.Build{}).Count(&total).Error
	return
}

func (r buildManagerRepository) CountByState(c context.Context, state string) (total int64, err error) {
	err = r.GetDB(c).Where("status = ?", state).Find(&model.Build{}).Count(&total).Error
	return
}

func (r buildManagerRepository) FindAll(c context.Context) (o []model.Build, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r buildManagerRepository) FindByUserId(c context.Context, userId string) (o []model.Build, err error) {
	err = r.GetDB(c).Where("owner = ?", userId).Find(&o).Error
	return
}
