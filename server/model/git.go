package model

import (
	"next-dbm/server/common"
)

// Commit 结构体用于存储每个提交的详细信息
type GitCommit struct {
	IsCurrent      bool     `json:"is_current"`
	Tag            []string `json:"tag"`
	Branch         string   `json:"branch"`
	FullID         string   `json:"full_id"`
	ShortID        string   `json:"short_id"`
	Title          string   `json:"title"`
	CreatedAt      string   `json:"created_at"`
	ParentIDs      []string `json:"parent_ids"`
	Message        string   `json:"message"`
	AuthorName     string   `json:"author_name"`
	AuthorEmail    string   `json:"author_email"`
	AuthoredDate   string   `json:"authored_date"`
	CommitterName  string   `json:"committer_name"`
	CommitterEmail string   `json:"committer_email"`
	CommittedDate  string   `json:"committed_date"`
}

type GitCommitDiffFile struct {
	OldVersion string `json:"oldVersion"`
	NewVersion string `json:"newVersion"`
}

type Git struct {
	ID              string          `gorm:"primary_key,type:varchar(36)" json:"id"`
	Name            string          `gorm:"type:varchar(500)" json:"name"`
	Content         string          `gorm:"type:text" json:"content"`
	Created         common.JsonTime `gorm:"type:timestamp" json:"created"`
	Owner           string          `gorm:"index;type:varchar(36)" json:"owner"`
	AssetId         string          `gorm:"type:varchar(36)" json:"assetId"`
	Database        string          `gorm:"type:varchar(200)" json:"database"`
	Tables          string          `gorm:"type:text" json:"tables"`
	DisTables       string          `gorm:"type:text" json:"disTables"`
	Sqls            string          `gorm:"type:text" json:"sqls"`
	GitRules        string          `gorm:"type:text" json:"gitRules"`
	GitTriggerRules string          `gorm:"type:text" json:"gitTriggerRules"`
	GitUrl          string          `gorm:"type:varchar(500)" json:"gitUrl"`
	AccountType     string          `gorm:"type:varchar(50)" json:"accountType"`
	CredentialId    string          `gorm:"type:varchar(36)" json:"credentialId"`
	Username        string          `gorm:"type:varchar(255)" json:"username"`
	Password        string          `gorm:"type:varchar(255)" json:"password"`
	PrivateKey      string          `gorm:"type:text" json:"privateKey"`
	Passphrase      string          `gorm:"type:varchar(500)" json:"passphrase"`
}

type GitForPage struct {
	ID        string          `gorm:"primary_key" json:"id"`
	Name      string          `json:"name"`
	Content   string          `json:"content"`
	Created   common.JsonTime `json:"created"`
	Owner     string          `json:"owner"`
	OwnerName string          `json:"ownerName"`
	AssetId   string          `json:"assetId"`
}

type GitRecoverInfo struct {
	ID       string `gorm:"primary_key" json:"id"`
	AssetId  string `json:"assetId"`
	Branch   string `json:"branch"`
	Database string `json:"database"`
	ShortId  string `json:"shortId"`
	Name     string `json:"name"`
	Content  string `json:"content"`
}

type GitTagInfo struct {
	ID      string `gorm:"primary_key" json:"id"`
	ShortId string `json:"shortId"`
	Name    string `json:"name"`
	Msg     string `json:"msg"`
}

func (r *Git) TableName() string {
	return "git"
}
