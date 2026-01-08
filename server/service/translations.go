package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"next-dbm/server/dto"
	"next-dbm/server/env"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"

	"gorm.io/gorm"
)

var TranslationsService = new(translationsService)

type translationsService struct {
	baseService
}

func (service translationsService) Export() (error, *dto.TranslationResponse) {
	ctx := context.TODO()

	trans, err := repository.TranslationsRepository.FindAll(ctx)
	if err != nil {
		return err, nil
	}
	messages := make(map[string]string)
	for i := range trans {
		messages[trans[i].TranslationKey] = trans[i].TranslationValue
	}

	translation := dto.TranslationResponse{
		LangCode: "en",
		Messages: messages,
	}
	return nil, &translation
}

func (service translationsService) Import(trans *dto.TranslationResponse) error {
	return env.GetDB().Transaction(func(tx *gorm.DB) error {
		ctx := service.Context(tx)

		for k, v := range trans.Messages {

			exist, _ := repository.TranslationsRepository.FindByLangCodeKey(ctx, trans.LangCode, k)
			if exist != nil && exist.ID != "" {
				repository.TranslationsRepository.DeleteById(ctx, exist.ID)
			}
			newId := utils.UUID()
			item := model.Translations{
				ID:               newId,
				LangCode:         trans.LangCode,
				TranslationKey:   k,
				TranslationValue: v,
			}
			if err := repository.TranslationsRepository.Create(ctx, &item); err != nil {
				return err
			}

		}

		return nil
	})

}

func (service translationsService) GetTranslations(langCode string) (*dto.TranslationResponse, error) {

	trans, err := repository.TranslationsRepository.FindByLangCode(context.TODO(), langCode)
	if err != nil {
		// 错误处理（记录日志或返回错误）
		return nil, fmt.Errorf("获取翻译失败: %w", err)
	}
	messages := make(map[string]string)
	// 遍历查询结果
	for _, item := range trans {
		// 将结果存入map
		messages[item.TranslationKey] = item.TranslationValue
	}
	reTrans := &dto.TranslationResponse{
		LangCode: langCode,
		Messages: messages,
	}

	return reTrans, nil
}

func (service translationsService) I18n(langCode string, key string) (*model.Translations, error) {
	trans, err := repository.TranslationsRepository.FindByLangCodeKey(context.TODO(), langCode, key)
	if err != nil {
		return nil, err
	}

	return trans, nil

}

func (service translationsService) GetLangs() ([]model.LangField, error) {
	var langFields []model.LangField

	propertyLangFields, err := repository.PropertyRepository.FindByName(context.TODO(), "langFields")
	if err != nil {
		langFields = []model.LangField{
			{Key: "zh-CN", Name: "简体中文", Type: "default"},
			{Key: "en-US", Name: "English", Type: "default"},
		}
		return langFields, nil
	}

	// 如果有值，尝试将 JSON 字符串解析为 Go 的结构体
	if propertyLangFields.Value != "" {
		err = json.Unmarshal([]byte(propertyLangFields.Value), &langFields)
		if err != nil {
			log.Fatal(err)
		}
	}

	// 如果 langFields 为空，则设置默认值
	if len(langFields) == 0 {
		langFields = []model.LangField{
			{Key: "zh-CN", Name: "简体中文", Type: "default"},
			{Key: "en-US", Name: "English", Type: "default"},
		}
	}

	return langFields, nil
}
