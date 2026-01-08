package model

import (
	"next-dbm/server/common"
)

type Sqls struct {
	ID        string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	Name      string          `gorm:"type:varchar(500)" json:"name"`
	Content   string          `gorm:"type:text" json:"content"`
	Created   common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner     string          `gorm:"type:varchar(36)" json:"owner"`
	DbAssetId string          `gorm:"type:varchar(36)" json:"dbAssetId"`
	DbName    string          `gorm:"type:varchar(200)" json:"dbName"`
}

type SqlsForPage struct {
	ID        string          `gorm:"primary_key" json:"id"`
	Name      string          `json:"name"`
	Content   string          `json:"content"`
	Created   common.JsonTime `json:"created"`
	Owner     string          `json:"owner"`
	OwnerName string          `json:"ownerName"`
	DbAssetId string          `json:"dbAssetId"`
	DbName    string          `json:"dbName"`
	AssetName string          `json:"assetName"`
}

func (r *Sqls) TableName() string {
	return "sqls"
}
