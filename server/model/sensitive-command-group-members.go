package model

type SensitiveCommandGroupMember struct {
	ID             string `gorm:"primary_key,type:varchar(36)" json:"id"`
	CommandId      string `gorm:"type:varchar(36)" json:"commandId"`
	CommandGroupId string `gorm:"type:varchar(36)" json:"commandGroupId"`
}

type SensitiveCommandGroupMemberForPage struct {
	ID             string `gorm:"primary_key" json:"id"`
	CommandId      string `json:"commandId"`
	CommandGroupId string `json:"commandGroupId"`
	Name           string `json:"name"`
	Content        string `json:"content"`
}

func (r *SensitiveCommandGroupMember) TableName() string {
	return "sensitive_command_group_members"
}
