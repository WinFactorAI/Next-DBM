package worker

import (
	"bufio"
	"context"
	"encoding/csv"
	"errors"
	"next-dbm/server/common/nd"
	"next-dbm/server/service"
	"strconv"
	"strings"

	"gorm.io/gorm"

	"next-dbm/server/api/abi"
	"next-dbm/server/common"
	"next-dbm/server/common/maps"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"

	"github.com/labstack/echo/v4"
)

type WorkCommandApi struct {
	abi.Abi
}

func (api WorkCommandApi) CommandCreateEndpoint(c echo.Context) error {
	var item model.Command
	if err := c.Bind(&item); err != nil {
		return err
	}

	account, _ := api.GetCurrentAccount(c)
	item.Owner = account.ID
	item.ID = utils.UUID()
	item.Created = common.NowJsonTime()

	if err := repository.CommandRepository.Create(context.TODO(), &item); err != nil {
		return err
	}

	return api.Success(c, item)
}

func (api WorkCommandApi) CommandAllEndpoint(c echo.Context) error {
	account, _ := api.GetCurrentAccount(c)
	userId := account.ID
	items, err := repository.CommandRepository.FindByUserId(context.Background(), userId)
	if err != nil {
		return err
	}
	return api.Success(c, items)
}

func (api WorkCommandApi) CommandImportEndpoint(c echo.Context) error {
	account, _ := api.GetCurrentAccount(c)

	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	src, err := file.Open()
	if err != nil {
		return err
	}

	defer func() {
		_ = src.Close()
	}()
	reader := csv.NewReader(bufio.NewReader(src))
	records, err := reader.ReadAll()
	if err != nil {
		return err
	}

	total := len(records)
	if total == 0 {
		return errors.New("csv数据为空")
	}
	var successCount = 0
	var errorCount = 0
	m := echo.Map{}

	for i := 0; i < total; i++ {
		record := records[i]
		if len(record) >= 2 {
			command := maps.Map{
				"id":      utils.UUID(),
				"name":    record[0],
				"content": record[1],
				"owner":   account.ID,
			}

			_, err := service.CommandService.Create(context.Background(), command)
			if err != nil {
				errorCount++
				m[strconv.Itoa(i)] = err.Error()
			} else {
				successCount++
			}
		}
	}

	return api.Success(c, echo.Map{
		"successCount": successCount,
		"errorCount":   errorCount,
		"data":         m,
	})
}
func (api WorkCommandApi) CommandPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	content := c.QueryParam("content")
	order := c.QueryParam("order")
	field := c.QueryParam("field")

	account, _ := api.GetCurrentAccount(c)
	userId := account.ID

	items, total, err := repository.CommandRepository.WorkerFind(context.TODO(), pageIndex, pageSize, name, content, order, field, userId)
	if err != nil {
		return err
	}

	return api.Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api WorkCommandApi) CommandUpdateEndpoint(c echo.Context) error {
	id := c.Param("id")

	if !api.checkPermission(c, id) {
		return nd.ErrPermissionDenied
	}

	var item model.Command
	if err := c.Bind(&item); err != nil {
		return err
	}

	if err := repository.CommandRepository.UpdateById(context.TODO(), &item, id); err != nil {
		return err
	}

	return api.Success(c, nil)
}

func (api WorkCommandApi) CommandDeleteEndpoint(c echo.Context) error {
	id := c.Param("id")
	split := strings.Split(id, ",")
	for i := range split {
		if !api.checkPermission(c, id) {
			return nd.ErrPermissionDenied
		}
		if err := repository.CommandRepository.DeleteById(context.TODO(), split[i]); err != nil {
			return err
		}
	}
	return api.Success(c, nil)
}

func (api WorkCommandApi) CommandGetEndpoint(c echo.Context) (err error) {
	id := c.Param("id")
	if !api.checkPermission(c, id) {
		return nd.ErrPermissionDenied
	}
	var item model.Command
	if item, err = repository.CommandRepository.FindById(context.TODO(), id); err != nil {
		return err
	}
	return api.Success(c, item)
}

func (api WorkCommandApi) checkPermission(c echo.Context, commandId string) bool {
	command, err := repository.CommandRepository.FindById(context.Background(), commandId)
	if err != nil {
		if errors.Is(gorm.ErrRecordNotFound, err) {
			return true
		}
		return false
	}
	account, _ := api.GetCurrentAccount(c)
	userId := account.ID

	return command.Owner == userId
}
