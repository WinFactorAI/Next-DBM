package dto

// 中间结构体用于解析JSON文件
type LanguageEntry struct {
	LangCode string            `json:"langCode"`
	Messages map[string]string `json:"messages"` // 键值对存储翻译内容
}
