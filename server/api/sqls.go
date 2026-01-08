package api

import (
	"context"
	"next-dbm/server/common"
	"next-dbm/server/common/maps"
	"strconv"
	"strings"

	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"

	"github.com/labstack/echo/v4"
)

type SqlsApi struct{}

func (api SqlsApi) SqlsCreateEndpoint(c echo.Context) error {
	var item model.Sqls
	if err := c.Bind(&item); err != nil {
		return err
	}

	account, _ := GetCurrentAccount(c)
	item.Owner = account.ID
	item.ID = utils.UUID()
	item.Created = common.NowJsonTime()

	if err := repository.SqlsRepository.Create(context.TODO(), &item); err != nil {
		return err
	}

	return Success(c, item)
}

func (api SqlsApi) SqlsAllEndpoint(c echo.Context) error {
	items, err := repository.SqlsRepository.FindAll(context.Background())
	if err != nil {
		return err
	}
	return Success(c, items)
}

func (api SqlsApi) SqlsPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	content := c.QueryParam("content")
	dbAssetId := c.QueryParam("dbAssetId")
	dbName := c.QueryParam("dbName")
	assetName := c.QueryParam("assetName")

	order := c.QueryParam("order")
	field := c.QueryParam("field")
	// account, _ := GetCurrentAccount(c)
	// owner := account.ID

	items, total, err := repository.SqlsRepository.Find(context.TODO(), pageIndex, pageSize, name, content, dbAssetId, assetName, dbName, order, field)
	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api SqlsApi) SqlsUpdateEndpoint(c echo.Context) error {
	id := c.Param("id")

	var item model.Sqls
	if err := c.Bind(&item); err != nil {
		return err
	}

	if err := repository.SqlsRepository.UpdateById(context.TODO(), &item, id); err != nil {
		return err
	}

	return Success(c, nil)
}

func (api SqlsApi) SqlsDeleteEndpoint(c echo.Context) error {
	id := c.Param("id")
	split := strings.Split(id, ",")
	for i := range split {
		if err := repository.SqlsRepository.DeleteById(context.TODO(), split[i]); err != nil {
			return err
		}
	}
	return Success(c, nil)
}

func (api SqlsApi) SqlsGetEndpoint(c echo.Context) (err error) {
	id := c.Param("id")
	var item model.Sqls
	if item, err = repository.SqlsRepository.FindById(context.TODO(), id); err != nil {
		return err
	}
	return Success(c, item)
}

func (api SqlsApi) SqlsChangeOwnerEndpoint(c echo.Context) (err error) {
	id := c.Param("id")
	owner := c.QueryParam("owner")
	if err := repository.SqlsRepository.UpdateById(context.TODO(), &model.Sqls{Owner: owner}, id); err != nil {
		return err
	}
	return Success(c, "")
}

func (api SqlsApi) SqlsCreateOrUpdateEndpoint(c echo.Context) error {
	// 绑定传入的数据到 itemIn
	var itemIn model.Sqls
	if err := c.Bind(&itemIn); err != nil {
		return err
	}

	var item model.Sqls
	// var err error

	// 如果 itemIn.ID 存在且不为空，则查询数据库，准备更新
	if itemIn.ID != "" {
		item, _ = repository.SqlsRepository.FindById(context.TODO(), itemIn.ID)
		// 如果数据库中没有找到对应的记录，走创建逻辑
		if item == (model.Sqls{}) {
			// 数据库中未找到，使用传入的 ID 创建新的记录
			account, _ := GetCurrentAccount(c)
			item = itemIn // 使用绑定的数据创建新的记录
			item.Owner = account.ID
			item.ID = itemIn.ID                 // 使用传入的 ID
			item.Created = common.NowJsonTime() // 设置创建时间
			item.DbName = itemIn.DbName
			item.DbAssetId = itemIn.DbAssetId

			// 插入新数据到数据库
			if err := repository.SqlsRepository.Create(context.TODO(), &item); err != nil {
				return err
			}
		} else {
			// 如果找到了记录，进行更新操作
			item.Name = itemIn.Name       // 更新数据字段
			item.Content = itemIn.Content // 根据需要更新其他字段
			item.DbName = itemIn.DbName
			item.DbAssetId = itemIn.DbAssetId
			// 更新数据库中的数据
			if err := repository.SqlsRepository.UpdateById(context.TODO(), &item, item.ID); err != nil {
				return err
			}
		}
	} else {
		// ID 为空，执行创建新数据的逻辑
		account, _ := GetCurrentAccount(c)
		item = itemIn // 使用绑定的数据创建新的记录
		item.Owner = account.ID
		item.ID = utils.UUID()              // 生成新的 UUID
		item.Created = common.NowJsonTime() // 设置创建时间
		item.DbName = itemIn.DbName
		item.DbAssetId = itemIn.DbAssetId
		// 插入新数据到数据库
		if err := repository.SqlsRepository.Create(context.TODO(), &item); err != nil {
			return err
		}
	}

	// 成功处理，返回响应
	return Success(c, nil)
}

func (api SqlsApi) SqlsGetIdEndpoint(c echo.Context) (err error) {
	item := utils.UUID()
	return Success(c, item)
}
