package model

type Property struct {
	Name  string `gorm:"primary_key" json:"name"`
	Value string `json:"value"`
}

func (r *Property) TableName() string {
	return "properties"
}

type VersionInfo struct {
	Version   string `json:"version"`
	Detail    string `json:"detail"`
	DownURL   string `json:"downUrl"`
	IsUpgrade string `json:"isUpgrade"`
}
