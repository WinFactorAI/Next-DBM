package api

import (
	"context"
	"next-dbm/server/common/maps"

	"strconv"
	"strings"

	"next-dbm/server/repository"

	"github.com/labstack/echo/v4"
)

type OperLogApi struct{}

func (api OperLogApi) OperLogPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	username := c.QueryParam("username")
	clientIp := c.QueryParam("clientIp")
	state := c.QueryParam("state")
	path := c.QueryParam("path")
	name := c.QueryParam("name")

	items, total, err := repository.OperLogRepository.Find(context.TODO(), pageIndex, pageSize, username, clientIp, state, path, name)

	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api OperLogApi) OperLogDeleteEndpoint(c echo.Context) error {
	ids := c.Param("id")
	tokens := strings.Split(ids, ",")
	// if err := service.UserService.DeleteOperLogs(tokens); err != nil {
	// 	return err
	// }
	for _, token := range tokens {
		// 删除登录日志
		if err := repository.OperLogRepository.DeleteById(context.TODO(), token); err != nil {
			return err
		}
	}

	return Success(c, nil)
}

func (api OperLogApi) OperLogClearEndpoint(c echo.Context) error {
	operLogs, err := repository.OperLogRepository.FindAllOperLogs(context.TODO())
	if err != nil {
		return err
	}
	// var tokens = make([]string, 0)
	for i := range operLogs {
		// tokens = append(tokens, operLogs[i].ID)
		// 删除登录日志
		if err := repository.OperLogRepository.DeleteById(context.TODO(), operLogs[i].ID); err != nil {
			return err
		}
	}

	// if err := service.UserService.DeleteOperLogs(tokens); err != nil {
	// 	return err
	// }
	return Success(c, nil)
}
