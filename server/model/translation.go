package model

type Translations struct {
	ID               string `gorm:"primary_key,type:varchar(36)"  json:"id"`
	LangCode         string `gorm:"type:text" json:"lang_code"`
	TranslationKey   string `gorm:"type:text" json:"translation_key"`
	TranslationValue string `gorm:"type:text" json:"translation_value"`
}

type LangField struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Type string `json:"type"`
}

func (r *Translations) TableName() string {
	return "translations"
}
