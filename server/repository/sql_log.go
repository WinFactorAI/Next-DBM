package repository

import (
	"context"
	"time"

	"next-dbm/server/dto"
	"next-dbm/server/model"
)

var SqlLogRepository = new(sqlLogRepository)

type sqlLogRepository struct {
	baseRepository
}

func (r sqlLogRepository) Find(c context.Context, pageIndex, pageSize int, assetId, owner, state string, reason string, sqlCommand string, sessionId string) (o []model.SqlLogForPage, total int64, err error) {
	m := model.SqlLog{}
	db := r.GetDB(c).Table(m.TableName()).Select("sql_logs.id,sql_logs.reason,sql_logs.sql_command,sql_logs.owner, users.nickname as owner_name,sql_logs.created ,sql_logs.asset_id,assets.name as asset_name,sql_logs.state").
		Joins("left join users on sql_logs.owner = users.id").
		Joins("left join assets on sql_logs.asset_id = assets.id").
		Group("sql_logs.id")
	dbCounter := r.GetDB(c).Table(m.TableName())

	if assetId != "" {
		db = db.Where("asset_id = ?", assetId)
		dbCounter = dbCounter.Where("asset_id = ?", assetId)
	}

	if owner != "" {
		db = db.Where("sql_logs.owner = ?", owner)
		dbCounter = dbCounter.Where("sql_logs.owner = ?", owner)
	}

	if state != "" {
		db = db.Where("sql_logs.state = ?", state)
		dbCounter = dbCounter.Where("sql_logs.state = ?", state)
	}

	if reason != "" {
		db = db.Where("sql_logs.reason = ?", "%"+reason+"%")
		dbCounter = dbCounter.Where("sql_logs.reason = ?", "%"+reason+"%")
	}

	if sqlCommand != "" {
		db = db.Where("sql_logs.sql_command like ?", "%"+sqlCommand+"%")
		dbCounter = dbCounter.Where("sql_logs.sql_command like ?", "%"+sqlCommand+"%")
	}

	if sessionId != "" {
		db = db.Where("sql_logs.session_id = ?", sessionId)
		dbCounter = dbCounter.Where("sql_logs.session_id = ?", sqlCommand)
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("sql_logs.created desc").Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]model.SqlLogForPage, 0)
	}
	return
}

func (r sqlLogRepository) FindAliveSqlLogs(c context.Context) (o []model.SqlLog, err error) {
	err = r.GetDB(c).Where("state = '1' and logout_time is null").Find(&o).Error
	return
}

func (r sqlLogRepository) FindAllSqlLogs(c context.Context) (o []model.SqlLog, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r sqlLogRepository) FindAliveSqlLogsByUsername(c context.Context, username string) (o []model.SqlLog, err error) {
	err = r.GetDB(c).Where("state = '1' and created is null and username = ?", username).Find(&o).Error
	return
}

func (r sqlLogRepository) FindOutTimeLog(c context.Context, dayLimit int) (o []model.SqlLog, err error) {
	limitTime := time.Now().Add(time.Duration(-dayLimit*24) * time.Hour)
	err = r.GetDB(c).Where("(state = '0' and created < ?) or (state = '1' and created < ?) or (state is null and created < ?)", limitTime, limitTime, limitTime).Find(&o).Error
	return
}

func (r sqlLogRepository) Create(c context.Context, o *model.SqlLog) (err error) {
	return r.GetDB(c).Create(o).Error
}

func (r sqlLogRepository) DeleteByIdIn(c context.Context, ids []string) (err error) {
	return r.GetDB(c).Where("id in ?", ids).Delete(&model.SqlLog{}).Error
}

func (r sqlLogRepository) DeleteById(c context.Context, id string) (err error) {
	return r.GetDB(c).Where("id = ?", id).Delete(&model.SqlLog{}).Error
}

func (r sqlLogRepository) Count(c context.Context) (total int64, err error) {
	err = r.GetDB(c).Find(&model.SqlLog{}).Count(&total).Error
	return
}
func (r sqlLogRepository) FindById(c context.Context, id string) (o model.SqlLog, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r sqlLogRepository) Update(c context.Context, o *model.SqlLog) error {
	return r.GetDB(c).Updates(o).Error
}

func (r sqlLogRepository) CountByState(c context.Context, state string) (total int64, err error) {
	err = r.GetDB(c).Where("state = ?", state).Find(&model.SqlLog{}).Count(&total).Error
	return
}

func (r sqlLogRepository) CountWithGroupByLoginTime(c context.Context, loginTime time.Time) (counter []dto.DateCounter, err error) {
	err = r.GetDB(c).Table("sql_logs").Select("date(created) as date, count(id) as value").Where("created > ?", loginTime).Group("date(created)").Scan(&counter).Error
	return
}

func (r sqlLogRepository) CountWithGroupByLoginTimeAndUsername(c context.Context, loginTime time.Time) (counter []dto.DateCounter, err error) {
	err = r.GetDB(c).Table("sql_logs").Select("date(created) as date, count(distinct(username)) as value").Where("created > ?", loginTime).Group("date(created), username").Scan(&counter).Error
	return
}
