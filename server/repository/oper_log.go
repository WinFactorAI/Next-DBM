package repository

import (
	"context"
	"time"

	"next-dbm/server/dto"
	"next-dbm/server/model"
)

var OperLogRepository = new(operLogRepository)

type operLogRepository struct {
	baseRepository
}

func (r operLogRepository) Find(c context.Context, pageIndex, pageSize int, username, clientIp, state, path, name string) (o []model.OperLog, total int64, err error) {
	m := model.OperLog{}
	db := r.GetDB(c).Table(m.TableName())
	dbCounter := r.GetDB(c).Table(m.TableName())

	if username != "" {
		db = db.Where("username like ?", "%"+username+"%")
		dbCounter = dbCounter.Where("username like ?", "%"+username+"%")
	}

	if clientIp != "" {
		db = db.Where("client_ip like ?", "%"+clientIp+"%")
		dbCounter = dbCounter.Where("client_ip like ?", "%"+clientIp+"%")
	}

	if state != "" {
		db = db.Where("state = ?", state)
		dbCounter = dbCounter.Where("state = ?", state)
	}

	if path != "" {
		db = db.Where("path like ?", "%"+path+"%")
		dbCounter = dbCounter.Where("path like ?", "%"+path+"%")
	}

	if name != "" {
		db = db.Where("name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("name like ?", "%"+name+"%")
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("created desc").Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.OperLog, 0)
	}
	return
}

func (r operLogRepository) FindAliveOperLogs(c context.Context) (o []model.OperLog, err error) {
	err = r.GetDB(c).Where("state = '1' and created is null").Find(&o).Error
	return
}

func (r operLogRepository) FindAllOperLogs(c context.Context) (o []model.OperLog, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r operLogRepository) FindAliveOperLogsByUsername(c context.Context, username string) (o []model.OperLog, err error) {
	err = r.GetDB(c).Where("state = '1' and created is null and username = ?", username).Find(&o).Error
	return
}

func (r operLogRepository) FindOutTimeLog(c context.Context, dayLimit int) (o []model.OperLog, err error) {
	created := time.Now().Add(time.Duration(-dayLimit*24) * time.Hour)
	err = r.GetDB(c).Where("(state = '0' and created < ?) or (state = '1' and created < ?) or (state is null and created < ?)", created, created, created).Find(&o).Error
	return
}

func (r operLogRepository) Create(c context.Context, o *model.OperLog) (err error) {
	return r.GetDB(c).Create(o).Error
}

func (r operLogRepository) DeleteByIdIn(c context.Context, ids []string) (err error) {
	return r.GetDB(c).Where("id in ?", ids).Delete(&model.OperLog{}).Error
}

func (r operLogRepository) DeleteById(c context.Context, id string) (err error) {
	return r.GetDB(c).Where("id = ?", id).Delete(&model.OperLog{}).Error
}

func (r operLogRepository) FindById(c context.Context, id string) (o model.OperLog, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r operLogRepository) Update(c context.Context, o *model.OperLog) error {
	return r.GetDB(c).Updates(o).Error
}

func (r operLogRepository) CountByState(c context.Context, state string) (total int64, err error) {
	err = r.GetDB(c).Where("state = ?", state).Find(&model.OperLog{}).Count(&total).Error
	return
}

func (r operLogRepository) CountWithGroupByLoginTime(c context.Context, created time.Time) (counter []dto.DateCounter, err error) {
	err = r.GetDB(c).Table("sql_logs").Select("date(created) as date, count(id) as value").Where("created > ?", created).Group("date(created)").Scan(&counter).Error
	return
}

func (r operLogRepository) CountWithGroupByLoginTimeAndUsername(c context.Context, created time.Time) (counter []dto.DateCounter, err error) {
	err = r.GetDB(c).Table("sql_logs").Select("date(created) as date, count(distinct(username)) as value").Where("created > ?", created).Group("date(created), username").Scan(&counter).Error
	return
}

func (r operLogRepository) UpdateOrAdd(c context.Context, o *model.OperLog) error {
	// 先尝试查找，找不到就创建新记录
	return r.GetDB(c).FirstOrCreate(o, model.OperLog{ID: o.ID}).Error
}
