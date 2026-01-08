package api

import (
	"context"
	"net/http"
	"next-dbm/server/repository"
	"next-dbm/server/utils"
	"strconv"

	"github.com/labstack/echo/v4"
)

type AiApi struct{}

type AiRequest struct {
	Prompt string `json:"prompt"`
	Type   string `json:"type"`
}

func (api AiApi) AskEndpoint(c echo.Context) error {
	var req AiRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	if req.Type == "deepseek" {
		propertyAiapiKey, err := repository.PropertyRepository.FindByName(context.Background(), "ai-deepseek-apiKey")
		if err != nil {
			return err
		}
		propertyMaxTokens, err := repository.PropertyRepository.FindByName(context.Background(), "ai-deepseek-maxTokens")
		if err != nil {
			return err
		}
		num, _ := strconv.Atoi(propertyMaxTokens.Value)

		propertyModel, err := repository.PropertyRepository.FindByName(context.Background(), "ai-deepseek-model")
		if err != nil {
			return err
		}
		resp, err := utils.CallDeepSeekAPI(req.Prompt, num, propertyAiapiKey.Value, propertyModel.Value)
		if err != nil {
			return err
		}
		return Success(c, resp)
	}
	return Success(c, "Not implemented")
}
