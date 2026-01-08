package model

import "next-dbm/server/common"

// Authorised 资产授权
type Authorised struct {
	ID                      string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	AssetId                 string          `gorm:"index,type:varchar(36)" json:"assetId"`
	CommandFilterId         string          `gorm:"index,type:varchar(36)" json:"commandFilterId"`
	StrategyId              string          `gorm:"index,type:varchar(36)" json:"strategyId"`
	SensitiveCommandGroupId string          `gorm:"index,type:varchar(36)" json:"sensitiveCommandGroupId"`
	UserId                  string          `gorm:"index,type:varchar(36)" json:"userId"`
	UserGroupId             string          `gorm:"index,type:varchar(36)" json:"userGroupId"`
	WebhookPushStatus       string          `gorm:"type:varchar(20)" json:"webhookPushStatus"`
	Created                 common.JsonTime `json:"created"`
}

func (m Authorised) TableName() string {
	return "authorised"
}
