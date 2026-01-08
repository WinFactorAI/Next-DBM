package model

import (
	"next-dbm/server/common"
)

type BuildLog struct {
	ID      string          `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name    string          `gorm:"type:varchar(500)" json:"name"`
	Content string          `gorm:"type:text" json:"content"`
	Created common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner   string          `gorm:"index;type:varchar(36)" json:"owner"`
	Status  string          `gorm:"type:varchar(50)" json:"status"`
	Trigger string          `gorm:"type:varchar(255)" json:"trigger"`
	BuildId string          `gorm:"type:varchar(36)" json:"buildId"`
	EnName  string          `gorm:"type:varchar(500)" json:"enName"`
}

type BuildLogForPage struct {
	ID        string          `gorm:"primary_key" json:"id"`
	Name      string          `json:"name"`
	Content   string          `json:"content"`
	Created   common.JsonTime `json:"created"`
	Owner     string          `json:"owner"`
	OwnerName string          `json:"ownerName"`
	Status    string          `json:"status"`
	Trigger   string          `json:"trigger"`
	BuildId   string          `json:"buildId"`
	EnName    string          `json:"enName"`
}

func (r *BuildLog) TableName() string {
	return "build_log"
}
