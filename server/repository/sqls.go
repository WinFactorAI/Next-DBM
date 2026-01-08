package repository

import (
	"context"

	"next-dbm/server/model"
)

var SqlsRepository = new(sqlsManagerRepository)

type sqlsManagerRepository struct {
	baseRepository
}

func (r sqlsManagerRepository) Find(c context.Context, pageIndex, pageSize int, name, content, dbAssetId, assetName, dbName, order, field string) (o []model.SqlsForPage, total int64, err error) {
	db := r.GetDB(c).Table("sqls").Select("sqls.id,sqls.name,sqls.content,sqls.owner,sqls.created, users.nickname as owner_name,sqls.db_name,assets.name as asset_name").
		Joins("left join users on sqls.owner = users.id").
		Joins("left join assets on sqls.db_asset_id = assets.id").
		Group("sqls.id")
	dbCounter := r.GetDB(c).Table("sqls")

	if len(name) > 0 {
		db = db.Where("sqls.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("sqls.name like ?", "%"+name+"%")
	}

	if len(content) > 0 {
		db = db.Where("sqls.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("sqls.content like ?", "%"+content+"%")
	}

	if len(dbAssetId) > 0 {
		db = db.Where("sqls.db_asset_id = ?", dbAssetId)
		dbCounter = dbCounter.Where("sqls.db_asset_id = ?", dbAssetId)
	}
	// if len(assetName) > 0 {
	// 	db = db.Where("assets.name = ?", assetName)
	// 	dbCounter = dbCounter.Where("assets.name = ?", assetName)
	// }

	if len(dbName) > 0 {
		db = db.Where("sqls.db_name = ?", dbName)
		dbCounter = dbCounter.Where("sqls.db_name = ?", dbName)
	}

	// if len(owner) > 0 {
	// 	db = db.Where("sqls.owner = ?", owner)
	// 	dbCounter = dbCounter.Where("sqls.owner = ?", owner)
	// }

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

	err = db.Order("sqls." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.SqlsForPage, 0)
	}
	return
}

func (r sqlsManagerRepository) WorkerFind(c context.Context, pageIndex, pageSize int, name, content, order, field, userId string) (o []model.SqlsForPage, total int64, err error) {
	db := r.GetDB(c).Table("sqls").Select("sqls.id,sqls.name,sqls.content,sqls.owner,sqls.created").Where("sqls.owner = ?", userId)
	dbCounter := r.GetDB(c).Table("sqls").Where("sqls.owner = ?", userId)

	if len(name) > 0 {
		db = db.Where("sqls.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("sqls.name like ?", "%"+name+"%")
	}

	if len(content) > 0 {
		db = db.Where("sqls.content like ?", "%"+content+"%")
		dbCounter = dbCounter.Where("sqls.content like ?", "%"+content+"%")
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

	err = db.Order("sqls." + field + " " + order).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.SqlsForPage, 0)
	}
	return
}

func (r sqlsManagerRepository) Create(c context.Context, o *model.Sqls) (err error) {
	if err = r.GetDB(c).Create(o).Error; err != nil {
		return err
	}
	return nil
}

func (r sqlsManagerRepository) FindById(c context.Context, id string) (o model.Sqls, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r sqlsManagerRepository) UpdateById(c context.Context, o *model.Sqls, id string) error {
	o.ID = id
	return r.GetDB(c).Updates(o).Error
}

func (r sqlsManagerRepository) DeleteById(c context.Context, id string) error {
	return r.GetDB(c).Where("id = ?", id).Delete(&model.Sqls{}).Error
}

func (r sqlsManagerRepository) FindAll(c context.Context) (o []model.Sqls, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r sqlsManagerRepository) FindByUserId(c context.Context, userId string) (o []model.Sqls, err error) {
	err = r.GetDB(c).Where("owner = ?", userId).Find(&o).Error
	return
}
