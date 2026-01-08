package abi

import (
	"next-dbm/server/common/maps"
	"next-dbm/server/common/nd"
	"next-dbm/server/dto"
	"next-dbm/server/global/cache"
	"next-dbm/server/model"

	"github.com/labstack/echo/v4"
)

type Abi struct {
}

func (r *Abi) Fail(c echo.Context, code int, message string) error {
	return c.JSON(200, maps.Map{
		"code":    code,
		"message": message,
	})
}

func (r *Abi) FailWithData(c echo.Context, code int, message string, data interface{}) error {
	return c.JSON(200, maps.Map{
		"code":    code,
		"message": message,
		"data":    data,
	})
}

func (r *Abi) Success(c echo.Context, data interface{}) error {
	return c.JSON(200, maps.Map{
		"code":    1,
		"message": "success",
		"data":    data,
	})
}

func (r *Abi) GetToken(c echo.Context) string {
	token := c.Request().Header.Get(nd.Token)
	if len(token) > 0 {
		return token
	}
	return c.QueryParam(nd.Token)
}

func (r *Abi) GetCurrentAccount(c echo.Context) (*model.User, bool) {
	token := r.GetToken(c)
	get, b := cache.TokenManager.Get(token)
	if b {
		return get.(dto.Authorization).User, true
	}
	return nil, false
}

func (r *Abi) HasPermission(c echo.Context, owner string) bool {
	// 检测是否登录
	account, found := r.GetCurrentAccount(c)
	if !found {
		return false
	}
	// 检测是否为管理人员
	if nd.TypeAdmin == account.Type {
		return true
	}
	// 检测是否为所有者
	if owner == account.ID {
		return true
	}
	return false
}
