package api

import (
	"context"
	"next-dbm/server/common"
	"next-dbm/server/common/maps"
	"next-dbm/server/model"
	"next-dbm/server/utils"
	"strconv"
	"strings"

	"next-dbm/server/repository"

	"github.com/labstack/echo/v4"
)

type SqlLogApi struct{}

func (api SqlLogApi) SqlLogCreateEndpoint(c echo.Context) error {
	var item model.SqlLog
	if err := c.Bind(&item); err != nil {
		return err
	}

	account, _ := GetCurrentAccount(c)
	item.Owner = account.ID
	item.ID = utils.UUID()
	item.Created = common.NowJsonTime()

	if err := repository.SqlLogRepository.Create(context.TODO(), &item); err != nil {
		return err
	}

	return Success(c, item)
}
func (api SqlLogApi) SqlLogPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	assetId := c.QueryParam("assetId")
	owner := c.QueryParam("owner")
	sessionId := c.QueryParam("sessionId")
	state := c.QueryParam("state")
	reason := c.QueryParam("reason")
	sqlCommand := c.QueryParam("sqlCommand")

	items, total, err := repository.SqlLogRepository.Find(context.TODO(), pageIndex, pageSize, assetId, owner, state, reason, sqlCommand, sessionId)

	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api SqlLogApi) SqlLogDeleteEndpoint(c echo.Context) error {
	ids := c.Param("id")
	tokens := strings.Split(ids, ",")
	// if err := service.UserService.DeleteSqlLogs(tokens); err != nil {
	// 	return err
	// }
	for _, token := range tokens {
		// 删除登录日志
		if err := repository.SqlLogRepository.DeleteById(context.TODO(), token); err != nil {
			return err
		}
	}

	return Success(c, nil)
}

func (api SqlLogApi) SqlLogClearEndpoint(c echo.Context) error {
	loginLogs, err := repository.SqlLogRepository.FindAllSqlLogs(context.TODO())
	if err != nil {
		return err
	}
	// var tokens = make([]string, 0)
	for i := range loginLogs {
		// tokens = append(tokens, loginLogs[i].ID)
		// 删除登录日志
		if err := repository.SqlLogRepository.DeleteById(context.TODO(), loginLogs[i].ID); err != nil {
			return err
		}
	}

	// if err := service.UserService.DeleteSqlLogs(tokens); err != nil {
	// 	return err
	// }
	return Success(c, nil)
}
