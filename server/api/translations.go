package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"next-dbm/server/dto"
	"next-dbm/server/log"
	"next-dbm/server/service"

	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

type TranslationsApi struct{}

func (api TranslationsApi) TranslationsExportEndpoint(c echo.Context) error {
	err, translations := service.TranslationsService.Export()
	if err != nil {
		return err
	}

	jsonBytes, err := json.Marshal(translations)
	if err != nil {
		return err
	}
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=i18n_%s.json", time.Now().Format("20060102150405")))
	return c.Stream(http.StatusOK, echo.MIMEOctetStream, bytes.NewReader(jsonBytes))
}

func (api TranslationsApi) TranslationsImportEndpoint(c echo.Context) error {
	var translations []dto.TranslationResponse
	if err := c.Bind(&translations); err != nil {
		return err
	}
	log.Info(" 导入 ", zap.Any("translations", translations))
	for _, item := range translations {
		// Process each item if needed
		if err := service.TranslationsService.Import(&item); err != nil {
			return err
		}
	}

	return Success(c, "")
}

// 获取语言包接口
func (api TranslationsApi) GetTranslations(c echo.Context) error {
	langCode := c.Param("lng")
	trans, err := service.TranslationsService.GetTranslations(langCode)
	if err != nil {
		return err
	}
	return Success(c, trans)
}

func (api TranslationsApi) GetI18nEndpoint(c echo.Context) error {
	langCode := c.Param("lang")
	key := c.Param("key")
	trans, err := service.TranslationsService.I18n(langCode, key)
	if err != nil {
		return err
	}
	return Success(c, trans)
}

func (api TranslationsApi) GetLangsEndpoint(c echo.Context) error {
	langs, err := service.TranslationsService.GetLangs()
	if err != nil {
		return err
	}
	return Success(c, langs)
}
