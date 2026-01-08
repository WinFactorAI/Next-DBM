package model

import (
	"next-dbm/server/common"
)

type BuildQueue struct {
	ID         string          `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name       string          `gorm:"type:varchar(500)" json:"name"`
	Content    string          `gorm:"type:text" json:"content"`
	Created    common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner      string          `gorm:"index;type:varchar(36)" json:"owner"`
	Status     string          `gorm:"type:varchar(50)" json:"status"`
	GitId      string          `gorm:"type:varchar(36)" json:"git_id"`
	AssetId    string          `gorm:"type:varchar(36)" json:"asset_id"`
	ClassType  string          `gorm:"type:varchar(50)" json:"class_type"`
	BuildId    string          `gorm:"type:varchar(36)" json:"build_id"`
	Trigger    string          `gorm:"type:varchar(500)" json:"trigger"`
	EnName     string          `gorm:"type:varchar(200)" json:"enName"`
	BuildLogId string          `gorm:"type:varchar(36)" json:"build_log_id"`
}

type BuildQueueForPage struct {
	ID        string          `gorm:"primary_key" json:"id"`
	Name      string          `json:"name"`
	Content   string          `json:"content"`
	Created   common.JsonTime `json:"created"`
	Owner     string          `json:"owner"`
	OwnerName string          `json:"ownerName"`
	Status    string          `json:"status"`
	GitId     string          `json:"git_id"`
	AssetId   string          `json:"asset_id"`
	ClassType string          `json:"class_type"`
	BuildId   string          `json:"build_id"`
	Trigger   string          `json:"trigger"`
	EnName    string          `json:"enName"`
}

func (r *BuildQueue) TableName() string {
	return "build_queue"
}
