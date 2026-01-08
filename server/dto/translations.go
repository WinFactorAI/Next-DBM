package dto

type TranslationResponse struct {
	LangCode string            `json:"langCode"`
	Messages map[string]string `json:"messages"`
}
