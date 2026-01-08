package api

import (
	"context"
	"next-dbm/server/common"
	"next-dbm/server/common/maps"
	"next-dbm/server/common/nd"
	"strconv"
	"strings"

	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/service"
	"next-dbm/server/utils"

	"github.com/labstack/echo/v4"
)

type JobApi struct{}

func (api JobApi) JobCreateEndpoint(c echo.Context) error {
	var item model.Job
	if err := c.Bind(&item); err != nil {
		return err
	}

	item.ID = utils.UUID()
	item.Created = common.NowJsonTime()
	// 构建默认设置全部
	if item.Func == nd.BuildJob {
		item.Mode = nd.JobModeAll
	}
	if err := service.JobService.Create(context.TODO(), &item); err != nil {
		return err
	}
	return Success(c, "")
}

func (api JobApi) JobPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	status := c.QueryParam("status")

	order := c.QueryParam("order")
	field := c.QueryParam("field")

	items, total, err := repository.JobRepository.Find(context.TODO(), pageIndex, pageSize, name, status, order, field)
	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api JobApi) JobUpdateEndpoint(c echo.Context) error {
	id := c.Param("id")

	var item model.Job
	if err := c.Bind(&item); err != nil {
		return err
	}
	item.ID = id

	// 构建默认设置全部
	if item.Func == nd.BuildJob {
		item.Mode = nd.JobModeAll
	}
	if err := service.JobService.UpdateById(&item); err != nil {
		return err
	}

	return Success(c, nil)
}

func (api JobApi) JobChangeStatusEndpoint(c echo.Context) error {
	id := c.Param("id")
	status := c.QueryParam("status")
	if err := service.JobService.ChangeStatusById(id, status); err != nil {
		return err
	}
	return Success(c, "")
}

func (api JobApi) JobExecEndpoint(c echo.Context) error {
	id := c.Param("id")
	if err := service.JobService.ExecJobById(id); err != nil {
		return err
	}
	return Success(c, "")
}

func (api JobApi) JobDeleteEndpoint(c echo.Context) error {
	ids := c.Param("id")

	split := strings.Split(ids, ",")
	for i := range split {
		jobId := split[i]
		if err := service.JobService.DeleteJobById(jobId); err != nil {
			return err
		}
	}

	return Success(c, nil)
}

func (api JobApi) JobGetEndpoint(c echo.Context) error {
	id := c.Param("id")

	item, err := repository.JobRepository.FindById(context.TODO(), id)
	if err != nil {
		return err
	}

	return Success(c, item)
}

func (api JobApi) JobGetLogsEndpoint(c echo.Context) error {
	id := c.Param("id")
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	items, total, err := repository.JobLogRepository.FindByJobId(context.TODO(), id, pageIndex, pageSize)
	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api JobApi) JobDeleteLogsEndpoint(c echo.Context) error {
	id := c.Param("id")
	if err := repository.JobLogRepository.DeleteByJobId(context.TODO(), id); err != nil {
		return err
	}
	return Success(c, "")
}
