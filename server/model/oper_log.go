package model

import (
	"next-dbm/server/common"
)

type OperLog struct {
	ID         string          `gorm:"primary_key,type:varchar(128)" json:"id"`
	UserId     string          `gorm:"index,type:varchar(36)" json:"userId"`
	Username   string          `gorm:"index,type:varchar(200)" json:"username"`
	Path       string          `gorm:"type:varchar(500)" json:"path"`
	Method     string          `json:"method"`
	StatusCode int             `json:"statusCode"`
	ClientIP   string          `gorm:"type:varchar(200)" json:"clientIp"`
	Latency    int64           `gorm:"type:number" json:"latency"`
	UserAgent  string          `gorm:"type:varchar(500)" json:"userAgent"`
	Name       string          `gorm:"type:varchar(200)" json:"name"`
	Created    common.JsonTime `gorm:"type:timestamp" json:"created"`
	State      string          `gorm:"type:varchar(1)" json:"state"` // 成功 1 失败 0
	Reason     string          `gorm:"type:varchar(500)" json:"reason"`
}

func (r *OperLog) TableName() string {
	return "oper_logs"
}
