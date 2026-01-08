package model

import (
	"next-dbm/server/common"
)

type TriggerCommand struct {
	ID      string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	Name    string          `gorm:"type:varchar(500)" json:"name"`
	Content string          `gorm:"type:varchar(500)" json:"content"`
	Created common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner   string          `gorm:"index,type:varchar(36)" json:"owner"`
}

type TriggerCommandForPage struct {
	ID        string          `gorm:"primary_key" json:"id"`
	Name      string          `json:"name"`
	Content   string          `json:"content"`
	Created   common.JsonTime `json:"created"`
	Owner     string          `json:"owner"`
	OwnerName string          `json:"ownerName"`
}

func (r *TriggerCommand) TableName() string {
	return "trigger_commands"
}
