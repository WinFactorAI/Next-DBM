package model

import (
	"next-dbm/server/common"
)

type SqlLog struct {
	ID         string          `gorm:"primary_key,type:varchar(128)" json:"id"`
	Owner      string          `gorm:"index,type:varchar(200)" json:"owner"`
	AssetId    string          `gorm:"index,type:varchar(200)" json:"assetId"`
	Created    common.JsonTime `gorm:"type:timestamp" json:"created"`
	State      string          `gorm:"type:varchar(1)" json:"state"` // 成功 1 失败 0
	Reason     string          `gorm:"type:varchar(500)" json:"reason"`
	SqlCommand string          `gorm:"type:text" json:"sqlCommand"`
	SessionId  string          `gorm:"type:text" json:"sessionId"`
}

type SqlLogForPage struct {
	ID         string          `gorm:"primary_key,type:varchar(128)" json:"id"`
	Owner      string          `gorm:"index,type:varchar(200)" json:"owner"`
	AssetId    string          `gorm:"index,type:varchar(200)" json:"assetId"`
	Created    common.JsonTime `json:"created"`
	State      string          `gorm:"type:varchar(1)" json:"state"` // 成功 1 失败 0
	Reason     string          `gorm:"type:varchar(500)" json:"reason"`
	SqlCommand string          `json:"sqlCommand"`
	AssetName  string          `json:"assetName"`
	OwnerName  string          `json:"ownerName"`
}

func (r *SqlLog) TableName() string {
	return "sql_logs"
}
