package model

import (
	"next-dbm/server/common"
)

type Build struct {
	ID         string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	Name       string          `gorm:"type:varchar(500)" json:"name"`
	Content    string          `gorm:"type:text" json:"content"`
	Created    common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner      string          `gorm:"index,type:varchar(36)" json:"owner"`
	GitId      string          `gorm:"index,type:varchar(36)" json:"gitId"`
	EnName     string          `gorm:"type:varchar(200)" json:"enName"`
	RunIndex   int             `gorm:"type:int(11)" json:"runIndex"`
	Status     string          `gorm:"type:varchar(50)" json:"status"`
	Triggers   []BuildTrigger  `json:"triggers"`
	SassetId   string          `gorm:"index,type:varchar(36)" json:"sassetId"`
	Sdatabase  string          `gorm:"type:varchar(200)" json:"sdatabase"`
	Stables    string          `gorm:"type:text" json:"stables"`
	Sqls       string          `gorm:"type:text" json:"sqls"`
	BuildRules string          `gorm:"type:text" json:"buildRules"`
	DassetId   string          `gorm:"index,type:varchar(36)" json:"dassetId"`
	Ddatabase  string          `gorm:"type:varchar(200)" json:"ddatabase"`
	WebhookId  string          `gorm:"-" json:"webhookId"`
}

type BuildForPage struct {
	ID        string          `gorm:"primary_key" json:"id"`
	Name      string          `gorm:"type:varchar(500)" json:"name"`
	Content   string          `gorm:"type:text" json:"content"`
	Created   common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner     string          `gorm:"index,type:varchar(36)" json:"owner"`
	OwnerName string          `gorm:"type:varchar(200)" json:"ownerName"`
	GitId     string          `gorm:"index,type:varchar(36)" json:"gitId"`
	EnName    string          `gorm:"type:varchar(200)" json:"enName"`
	RunIndex  int             `gorm:"type:int(11)" json:"runIndex"`
	Status    string          `gorm:"type:varchar(50)" json:"status"`
}

func (r *Build) TableName() string {
	return "build"
}
