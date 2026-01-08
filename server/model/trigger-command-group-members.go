package model

type TriggerCommandGroupMember struct {
	ID             string `gorm:"primary_key,type:varchar(36)" json:"id"`
	CommandId      string `gorm:"type:varchar(36)" json:"commandId"`
	CommandGroupId string `gorm:"type:varchar(36)" json:"commandGroupId"`
}

type TriggerCommandGroupMemberForPage struct {
	ID             string `gorm:"primary_key" json:"id"`
	CommandId      string `json:"commandId"`
	CommandGroupId string `json:"commandGroupId"`
	Name           string `json:"name"`
	Content        string `json:"content"`
}

func (r *TriggerCommandGroupMember) TableName() string {
	return "trigger_command_group_members"
}
