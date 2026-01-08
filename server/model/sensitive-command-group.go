package model

import (
	"next-dbm/server/common"
)

type SensitiveCommandGroup struct {
	ID          string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	Name        string          `gorm:"type:varchar(500)" json:"name"`
	Content     string          `gorm:"type:varchar(500)" json:"content"`
	Created     common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner       string          `gorm:"index,type:varchar(36)" json:"owner"`
	WebhookId   string          `gorm:"-" json:"webhookId"`
	WebhookName string          `gorm:"-" json:"webhookName"`
}

type SensitiveCommandGroupForCU struct {
	ID         string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	Name       string          `gorm:"type:varchar(500)" json:"name"`
	Content    string          `json:"content"`
	Created    common.JsonTime `json:"created"`
	Owner      string          `gorm:"index,type:varchar(36)" json:"owner"`
	CommandIds []string        `json:"commandIds"`
	WebhookId  string          `json:"webhookId"`
}

type SensitiveCommandGroupForPage struct {
	ID          string          `gorm:"primary_key" json:"id"`
	Name        string          `json:"name"`
	Content     string          `json:"content"`
	Created     common.JsonTime `json:"created"`
	Owner       string          `json:"owner"`
	OwnerName   string          `json:"ownerName"`
	WebhookId   string          `json:"webhookId"`
	WebhookName string          `json:"webhookName"`
}

func (r *SensitiveCommandGroup) TableName() string {
	return "sensitive_command_groups"
}
