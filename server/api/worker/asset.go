package worker

import (
	"context"
	"next-dbm/server/api/abi"
	"next-dbm/server/common/maps"
	"next-dbm/server/model"
	"next-dbm/server/service"
	"strconv"

	"github.com/labstack/echo/v4"
)

type WorkAssetApi struct {
	abi.Abi
}

func (api WorkAssetApi) AssetTypeEndpoint(c echo.Context) error {
	return api.Success(c, model.AssetTypes)
}

func (api WorkAssetApi) PagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	protocol := c.QueryParam("protocol")
	tags := c.QueryParam("tags")

	order := c.QueryParam("order")
	field := c.QueryParam("field")
	account, _ := api.GetCurrentAccount(c)

	items, total, err := service.WorkerService.FindMyAssetPaging(pageIndex, pageSize, name, protocol, tags, account.ID, order, field)
	if err != nil {
		return err
	}
	for i := range items {
		items[i].IP = ""
		items[i].Port = 0
	}

	return api.Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (api WorkAssetApi) PagingTreeEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	protocol := c.QueryParam("protocol")
	tags := c.QueryParam("tags")

	order := c.QueryParam("order")
	field := c.QueryParam("field")
	account, _ := api.GetCurrentAccount(c)

	items, total, err := service.WorkerService.FindMyAssetPaging(pageIndex, pageSize, name, protocol, tags, account.ID, order, field)
	if err != nil {
		return err
	}

	var menuItems []model.MenuItem
	for i := range items {
		items[i].IP = ""
		items[i].Port = 0
		// 创建数据库级别的 MenuItem
		// 			Key:      fmt.Sprintf("%s-%d", items[i].ID, i),
		assetMenuItem := model.MenuItem{
			Title:    items[i].Name,
			Key:      items[i].ID,
			MenuType: "asset",
			Children: []model.MenuItem{},
			IsLeaf:   false,
			Attr:     map[string]interface{}{"protocol": items[i].Protocol},
		}
		// 将数据库菜单项添加到最终结果中
		menuItems = append(menuItems, assetMenuItem)
	}

	return api.Success(c, maps.Map{
		"total": total,
		"items": menuItems,
	})
}

func (api WorkAssetApi) TagsEndpoint(c echo.Context) (err error) {
	account, _ := api.GetCurrentAccount(c)
	var items []string
	if items, err = service.WorkerService.FindMyAssetTags(context.TODO(), account.ID); err != nil {
		return err
	}
	return api.Success(c, items)
}

func (api WorkAssetApi) GatewayEndpoint(c echo.Context) error {
	id := c.Param("id")
	account, _ := api.GetCurrentAccount(c)
	var items map[string]string
	items, err := service.WorkerService.GetAssetGatewayByID(id, account.ID)
	if err != nil {
		return err
	}
	return api.Success(c, items)

}
