package model

import (
	"next-dbm/server/common"
)

type BuildTrigger struct {
	ID         string          `gorm:"primaryKey;type:varchar(36)" json:"id"`
	BuildId    string          `gorm:"type:varchar(36)" json:"buildId"`
	Created    common.JsonTime `gorm:"type:timestamp" json:"created"`
	Trigger    string          `gorm:"type:varchar(255)" json:"trigger"`
	WebhookUrl string          `gorm:"type:varchar(500)" json:"webhookUrl"`
	SecreToken string          `gorm:"type:varchar(255)" json:"secreToken"`
	Attr       string          `gorm:"type:text" json:"attr"`
}

type BuildTriggerForPage struct {
	ID         string          `gorm:"primary_key" json:"id"`
	BuildId    string          `json:"buildId"`
	Created    common.JsonTime `json:"created"`
	Trigger    string          `json:"trigger"`
	WebhookUrl string          `json:"webhookUrl"`
	SecreToken string          `json:"secreToken"`
	Attr       string          `json:"attr"`
}

func (r *BuildTrigger) TableName() string {
	return "build_trigger"
}
