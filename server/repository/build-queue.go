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

var BuildQueueRepository = new(buildManagerQueueRepository)

type buildManagerQueueRepository struct {
	baseRepository
}

func (r buildManagerQueueRepository) Find(c context.Context, pageIndex, pageSize int, name, content, classType, order, field string) (o []model.BuildQueueForPage, total int64, err error) {
	db := r.GetDB(c).Table("Build_queue").Select("Build_queue.id,Build_queue.name,Build_queue.content,Build_queue.owner,Build_queue.created, users.nickname as owner_name, Build_queue.status as status").
		Joins("left join users on Build_queue.owner = users.id").
		Group("Build_queue.id")
	dbCounter := r.GetDB(c).Table("Build_queue")

	if len(name) > 0 {
		db = db.Where("Build_queue.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("Build_queue.name like ?", "%"+name+"%")
	}

	if len(content) > 0 {
		db = db.Where("Build_queue.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("Build_queue.content like ?", "%"+content+"%")
	}
	if len(classType) > 0 {
		db = db.Where("Build_queue.class_type = ?", classType)
		dbCounter = dbCounter.Where("Build_queue.class_type = ?", classType)
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

	err = db.Order("Build_queue." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildQueueForPage, 0)
	}
	return
}

func (r buildManagerQueueRepository) WorkerFind(c context.Context, pageIndex, pageSize int, name, content, classType, order, field, userId string) (o []model.BuildQueueForPage, total int64, err error) {
	db := r.GetDB(c).Table("Build_queue").Select("Build_queue.id,Build_queue.name,Build_queue.content,Build_queue.owner,Build_queue.created").Where("Build_queue.owner = ?", userId)
	dbCounter := r.GetDB(c).Table("Build_queue").Where("Build_queue.owner = ?", userId)

	if len(name) > 0 {
		db = db.Where("Build_queue.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("Build_queue.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("Build_queue.class_type = ?", "'"+classType+"'")
	}

	if len(content) > 0 {
		db = db.Where("Build_queue.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("Build_queue.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("Build_queue.class_type = ", "'"+classType+"'")
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

	err = db.Order("Build_queue." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.BuildQueueForPage, 0)
	}
	return
}

func (r buildManagerQueueRepository) Create(c context.Context, o *model.BuildQueue) (err error) {
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

func (r buildManagerQueueRepository) FindById(c context.Context, id string) (o model.BuildQueue, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r buildManagerQueueRepository) FindByClassType(c context.Context, classType string) (o []model.BuildQueue, err error) {
	err = r.GetDB(c).Where("class_type = ?", classType).Find(&o).Error
	return
}

func (r buildManagerQueueRepository) UpdateById(c context.Context, o *model.BuildQueue, id string) error {
	o.ID = id
	return r.GetDB(c).Updates(o).Error
}

func (r buildManagerQueueRepository) DeleteById(c context.Context, id string) error {
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

	return r.GetDB(c).Where("id = ?", id).Delete(&model.BuildQueue{}).Error
}

func (r buildManagerQueueRepository) FindAll(c context.Context) (o []model.BuildQueue, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r buildManagerQueueRepository) FindByUserId(c context.Context, userId string) (o []model.BuildQueue, err error) {
	err = r.GetDB(c).Where("owner = ?", userId).Find(&o).Error
	return
}
