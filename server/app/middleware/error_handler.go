package middleware

import (
	"context"
	"fmt"
	"next-dbm/server/common"
	"next-dbm/server/log"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/service"
	"next-dbm/server/utils"

	"next-dbm/server/api"

	"github.com/labstack/echo/v4"
)

func OperationLogMiddleware(c echo.Context, statusCode int, reason string) {

	// 请求前记录开始时间
	start := common.NowJsonTime()

	account, _ := api.GetCurrentAccount(c)
	name := service.GetMenuNameByPermission(c.Request().Method, c.Path())
	logEntry := model.OperLog{
		ID:         utils.UUID(),
		Name:       name,
		UserId:     account.ID,
		Username:   account.Nickname, // 从JWT等获取
		Path:       c.Path(),
		Method:     c.Request().Method,
		StatusCode: statusCode,
		ClientIP:   c.RealIP(),
		Reason:     reason,
		Latency:    common.NowJsonTime().Since(start).Milliseconds(),
		UserAgent:  c.Request().UserAgent(),
		Created:    common.NowJsonTime(),
	}

	// 异步写入数据库
	go func(entry model.OperLog) {
		if err := repository.OperLogRepository.Create(context.Background(), &entry); err != nil {
			log.Error("操作日志写入失败:  ", log.NamedError("err", err))
		}
	}(logEntry)

}
func ErrorHandler(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		if err := next(c); err != nil {

			fmt.Printf("%+v\n", err)
			log.Error("api error", log.NamedError("err", err))
			if he, ok := err.(*echo.HTTPError); ok {
				message := fmt.Sprintf("%v", he.Message)
				OperationLogMiddleware(c, he.Code, message)
				return api.Fail(c, he.Code, message)
			}
			OperationLogMiddleware(c, -1, err.Error())
			return api.Fail(c, -1, err.Error())
		} else {
			OperationLogMiddleware(c, 1, "-")
		}
		return nil
	}
}
