package api

import (
	"bufio"
	"context"
	"encoding/csv"
	"errors"
	"next-dbm/server/common"
	"next-dbm/server/common/maps"
	"next-dbm/server/service"
	"strconv"
	"strings"

	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"

	"github.com/labstack/echo/v4"
)

type CommandApi struct{}

func (api CommandApi) CommandCreateEndpoint(c echo.Context) error {
	var item model.Command
	if err := c.Bind(&item); err != nil {
		return err
	}

	account, _ := GetCurrentAccount(c)
	item.Owner = account.ID
	item.ID = utils.UUID()
	item.Created = common.NowJsonTime()

	if err := repository.CommandRepository.Create(context.TODO(), &item); err != nil {
		return err
	}

	return Success(c, item)
}

func (api CommandApi) CommandAllEndpoint(c echo.Context) error {
	items, err := repository.CommandRepository.FindAll(context.Background())
	if err != nil {
		return err
	}
	return Success(c, items)
}

func (api CommandApi) CommandImportEndpoint(c echo.Context) error {
	account, _ := GetCurrentAccount(c)

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
			asset := maps.Map{
				"id":      utils.UUID(),
				"name":    record[0],
				"content": record[1],
				"owner":   account.ID,
			}

			_, err := service.CommandService.Create(context.Background(), asset)
			if err != nil {
				errorCount++
				m[strconv.Itoa(i)] = err.Error()
			} else {
				successCount++
			}
		}
	}

	return Success(c, echo.Map{
		"successCount": successCount,
		"errorCount":   errorCount,
		"data":         m,
	})
}
func (api CommandApi) CommandPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	content := c.QueryParam("content")

	order := c.QueryParam("order")
	field := c.QueryParam("field")

	items, total, err := repository.CommandRepository.Find(context.TODO(), pageIndex, pageSize, name, content, order, field)
	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api CommandApi) CommandUpdateEndpoint(c echo.Context) error {
	id := c.Param("id")

	var item model.Command
	if err := c.Bind(&item); err != nil {
		return err
	}

	if err := repository.CommandRepository.UpdateById(context.TODO(), &item, id); err != nil {
		return err
	}

	return Success(c, nil)
}

func (api CommandApi) CommandDeleteEndpoint(c echo.Context) error {
	id := c.Param("id")
	split := strings.Split(id, ",")
	for i := range split {
		if err := repository.CommandRepository.DeleteById(context.TODO(), split[i]); err != nil {
			return err
		}
	}
	return Success(c, nil)
}

func (api CommandApi) CommandGetEndpoint(c echo.Context) (err error) {
	id := c.Param("id")
	var item model.Command
	if item, err = repository.CommandRepository.FindById(context.TODO(), id); err != nil {
		return err
	}
	return Success(c, item)
}

func (api CommandApi) CommandChangeOwnerEndpoint(c echo.Context) (err error) {
	id := c.Param("id")
	owner := c.QueryParam("owner")
	if err := repository.CommandRepository.UpdateById(context.TODO(), &model.Command{Owner: owner}, id); err != nil {
		return err
	}
	return Success(c, "")
}
