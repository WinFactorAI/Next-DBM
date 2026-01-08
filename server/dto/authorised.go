package dto

import "next-dbm/server/common"

type AuthorisedAsset struct {
	AssetIds                []string `json:"assetIds"`
	CommandFilterId         string   `json:"commandFilterId"`
	StrategyId              string   `json:"strategyId"`
	SensitiveCommandGroupId string   `json:"sensitiveCommandGroupId"`
	UserId                  string   `json:"userId"`
	UserGroupId             string   `json:"userGroupId"`
	WebhookPushStatus       string   `json:"webhookPushStatus"`
}

type AuthorisedUser struct {
	UserIds                 []string `json:"userIds"`
	CommandFilterId         string   `json:"commandFilterId"`
	StrategyId              string   `json:"strategyId"`
	SensitiveCommandGroupId string   `json:"sensitiveCommandGroupId"`
	AssetId                 string   `json:"assetId"`
}

type AuthorisedUserGroup struct {
	UserGroupIds            []string `json:"UserGroupIds"`
	CommandFilterId         string   `json:"commandFilterId"`
	StrategyId              string   `json:"strategyId"`
	SensitiveCommandGroupId string   `json:"sensitiveCommandGroupId"`
	AssetId                 string   `json:"assetId"`
}

type AssetPageForAuthorised struct {
	Id                        string          `json:"id"`
	AssetId                   string          `json:"assetId"`
	AssetName                 string          `json:"assetName"`
	StrategyId                string          `json:"strategyId"`
	StrategyName              string          `json:"strategyName"`
	SensitiveCommandGroupId   string          `json:"sensitiveCommandGroupId"`
	SensitiveCommandGroupName string          `json:"sensitiveCommandGroupName"`
	WebhookPushStatus         string          `json:"webhookPushStatus"`
	Created                   common.JsonTime `json:"created"`
}

type UserPageForAuthorised struct {
	Id                        string          `json:"id"`
	UserId                    string          `json:"userId"`
	UserName                  string          `json:"userName"`
	StrategyId                string          `json:"strategyId"`
	StrategyName              string          `json:"strategyName"`
	SensitiveCommandGroupId   string          `json:"sensitiveCommandGroupId"`
	SensitiveCommandGroupName string          `json:"sensitiveCommandGroupName"`
	WebhookPushStatus         string          `json:"webhookPushStatus"`
	Created                   common.JsonTime `json:"created"`
}

type UserGroupPageForAuthorised struct {
	Id                        string          `json:"id"`
	UserGroupId               string          `json:"userGroupId"`
	UserGroupName             string          `json:"userGroupName"`
	StrategyId                string          `json:"strategyId"`
	StrategyName              string          `json:"strategyName"`
	SensitiveCommandGroupId   string          `json:"sensitiveCommandGroupId"`
	SensitiveCommandGroupName string          `json:"sensitiveCommandGroupName"`
	WebhookPushStatus         string          `json:"webhookPushStatus"`
	Created                   common.JsonTime `json:"created"`
}
