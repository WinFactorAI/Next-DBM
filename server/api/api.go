package api

import (
	"next-dbm/server/common/maps"
	"next-dbm/server/common/nd"
	"next-dbm/server/dto"
	"next-dbm/server/global/cache"
	"next-dbm/server/model"

	"github.com/labstack/echo/v4"
)

func Fail(c echo.Context, code int, message string) error {
	return c.JSON(200, maps.Map{
		"code":    code,
		"message": message,
	})
}

func FailWithData(c echo.Context, code int, message string, data interface{}) error {
	return c.JSON(200, maps.Map{
		"code":    code,
		"message": message,
		"data":    data,
	})
}

func Success(c echo.Context, data interface{}) error {
	return c.JSON(200, maps.Map{
		"code":    1,
		"message": "success",
		"data":    data,
	})
}

func GetToken(c echo.Context) string {
	token := c.Request().Header.Get(nd.Token)
	if len(token) > 0 {
		return token
	}
	return c.QueryParam(nd.Token)
}

func GetCurrentAccount(c echo.Context) (*model.User, bool) {
	token := GetToken(c)
	get, b := cache.TokenManager.Get(token)
	if b {
		return get.(dto.Authorization).User, true
	}
	return nil, false
}
