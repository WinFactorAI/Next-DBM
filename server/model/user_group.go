package model

import (
	"next-dbm/server/common"
)

type UserGroup struct {
	ID        string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	ParentId  string          `gorm:"type:varchar(36);default:'0'" json:"parentId"`
	Ancestors string          `gorm:"type:text" json:"ancestors"`
	Name      string          `gorm:"type:varchar(500)" json:"name"`
	Status    string          `gorm:"type:varchar(10)" json:"status"`
	Sort      int64           `json:"sort"`
	Created   common.JsonTime `json:"created"`
	DelFlag   int             `gorm:"type:int(1)" json:"delFlag"`
	Members   []string        `gorm:"-" json:"members"`
	SubItems  []UserGroup     `gorm:"-" json:"subItems"`
	Source    string          `gorm:"type:varchar(10)" json:"source"`
}

type UserGroupForPage struct {
	ID         string             `json:"id"`
	ParentId   string             `json:"parentId"`
	Ancestors  string             `json:"ancestors"`
	Name       string             `json:"name"`
	Status     string             `json:"status"`
	Sort       int64              `json:"sort"`
	Created    common.JsonTime    `json:"created"`
	DelFlag    int                `json:"delFlag"`
	AssetCount int64              `json:"assetCount"`
	SubItems   []UserGroupForPage `gorm:"-" json:"subItems"`
	Source     string             `json:"source"`
}

func (r *UserGroup) TableName() string {
	return "user_groups"
}

type UserGroupMember struct {
	ID          string `gorm:"primary_key" json:"name"`
	UserId      string `gorm:"index" json:"userId"`
	UserGroupId string `gorm:"index" json:"userGroupId"`
}

func (r *UserGroupMember) TableName() string {
	return "user_group_members"
}
