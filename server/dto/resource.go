package dto

import "next-dbm/server/model"

type RU struct {
	UserGroupId  string   `json:"userGroupId"`
	UserId       string   `json:"userId"`
	StrategyId   string   `json:"strategyId"`
	ResourceType string   `json:"resourceType"`
	ResourceIds  []string `json:"resourceIds"`
}

type UR struct {
	ResourceId   string   `json:"resourceId"`
	ResourceType string   `json:"resourceType"`
	UserIds      []string `json:"userIds"`
}

type Backup struct {
	Users                        []model.User                        `json:"users"`
	UserGroups                   []model.UserGroup                   `json:"user_groups"`
	Storages                     []model.Storage                     `json:"storages"`
	Strategies                   []model.Strategy                    `json:"strategies"`
	AccessSecurities             []model.AccessSecurity              `json:"access_securities"`
	AccessGateways               []model.AccessGateway               `json:"access_gateways"`
	Commands                     []model.Command                     `json:"commands"`
	Credentials                  []model.Credential                  `json:"credentials"`
	Assets                       []map[string]interface{}            `json:"assets"`
	Jobs                         []model.Job                         `json:"jobs"`
	Gits                         []model.Git                         `json:"gits"`
	Builds                       []model.Build                       `json:"builds"`
	SensitiveCommands            []model.SensitiveCommand            `json:"sensitive_commands"`
	SensitiveCommandGroups       []model.SensitiveCommandGroup       `json:"sensitive_command_groups"`
	SensitiveCommandGroupMembers []model.SensitiveCommandGroupMember `json:"sensitive_command_group_members"`
	Sqls                         []model.Sqls                        `json:"sqls"`
	Translations                 []model.Translations                `json:"translations"`
}
