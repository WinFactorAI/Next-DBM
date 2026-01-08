package api

import (
	"bufio"
	"context"
	"encoding/csv"
	"errors"
	"strconv"
	"strings"

	"next-dbm/server/common/maps"
	"next-dbm/server/common/nd"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/service"
	"next-dbm/server/utils"

	"github.com/labstack/echo/v4"
)

type DBMAssetApi struct{}

func (dbmAssetApi DBMAssetApi) DBMAssetCreateEndpoint(c echo.Context) error {
	m := maps.Map{}
	if err := c.Bind(&m); err != nil {
		return err
	}

	account, _ := GetCurrentAccount(c)
	m["owner"] = account.ID

	if _, err := service.AssetService.Create(context.TODO(), m); err != nil {
		return err
	}

	return Success(c, nil)
}

func (dbmAssetApi DBMAssetApi) DBMAssetImportEndpoint(c echo.Context) error {
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
		if len(record) >= 9 {
			port, _ := strconv.Atoi(record[3])
			asset := maps.Map{
				"id":          utils.UUID(),
				"name":        record[0],
				"protocol":    record[1],
				"ip":          record[2],
				"port":        port,
				"accountType": nd.Custom,
				"username":    record[4],
				"password":    record[5],
				"privateKey":  record[6],
				"passphrase":  record[7],
				"Description": record[8],
				"owner":       account.ID,
			}

			if record[6] != "" {
				asset["accountType"] = nd.PrivateKey
			}

			if len(record) >= 10 {
				tags := strings.ReplaceAll(record[9], "|", ",")
				asset["tags"] = tags
			}

			_, err := service.AssetService.Create(context.Background(), asset)
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

func (dbmAssetApi DBMAssetApi) DBMAssetPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	protocol := c.QueryParam("protocol")
	tags := c.QueryParam("tags")
	ip := c.QueryParam("ip")
	port := c.QueryParam("port")
	active := c.QueryParam("active")

	order := c.QueryParam("order")
	field := c.QueryParam("field")

	items, total, err := repository.AssetRepository.Find(context.Background(), pageIndex, pageSize, name, protocol, tags, ip, port, active, order, field)
	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (dbmAssetApi DBMAssetApi) DBMAssetAllEndpoint(c echo.Context) error {
	protocol := c.QueryParam("protocol")
	assets, err := repository.AssetRepository.FindByProtocol(context.TODO(), protocol)
	if err != nil {
		return err
	}
	items := make([]maps.Map, len(assets))
	for i, e := range assets {
		items[i] = maps.Map{
			"id":   e.ID,
			"name": e.Name,
		}
	}
	return Success(c, items)
}

func (dbmAssetApi DBMAssetApi) DBMAssetUpdateEndpoint(c echo.Context) error {
	id := c.Param("id")
	m := maps.Map{}
	if err := c.Bind(&m); err != nil {
		return err
	}
	if err := service.AssetService.UpdateById(id, m); err != nil {
		return err
	}
	return Success(c, nil)
}

func (dbmAssetApi DBMAssetApi) DBMAssetDeleteEndpoint(c echo.Context) error {
	id := c.Param("id")
	split := strings.Split(id, ",")
	for i := range split {
		if err := service.AssetService.DeleteById(split[i]); err != nil {
			return err
		}
	}

	return Success(c, nil)
}

func (dbmAssetApi DBMAssetApi) DBMAssetGetEndpoint(c echo.Context) (err error) {
	id := c.Param("id")

	var item model.Asset
	if item, err = service.AssetService.FindByIdAndDecrypt(context.TODO(), id); err != nil {
		return err
	}
	attributeMap, err := repository.AssetRepository.FindAssetAttrMapByAssetId(context.TODO(), id)
	if err != nil {
		return err
	}
	itemMap := utils.StructToMap(item)
	for key := range attributeMap {
		itemMap[key] = attributeMap[key]
	}

	return Success(c, itemMap)
}

func (dbmAssetApi DBMAssetApi) DBMAssetTcpingEndpoint(c echo.Context) (err error) {
	id := c.Param("id")

	var item model.Asset
	if item, err = repository.AssetRepository.FindById(context.TODO(), id); err != nil {
		return err
	}

	active, err := service.AssetService.CheckStatus(&item, item.IP, item.Port)

	var message = ""
	if err != nil {
		message = err.Error()
	}
	if err := repository.AssetRepository.UpdateActiveById(context.TODO(), active, message, item.ID); err != nil {
		return err
	}

	return Success(c, maps.Map{
		"active":  active,
		"message": message,
	})
}

func (dbmAssetApi DBMAssetApi) DBMAssetTagsEndpoint(c echo.Context) (err error) {
	var items []string
	if items, err = repository.AssetRepository.FindTags(context.TODO()); err != nil {
		return err
	}
	return Success(c, items)
}

func (dbmAssetApi DBMAssetApi) DBMAssetChangeOwnerEndpoint(c echo.Context) (err error) {
	id := c.Param("id")

	owner := c.QueryParam("owner")
	if err := repository.AssetRepository.UpdateById(context.TODO(), &model.Asset{Owner: owner}, id); err != nil {
		return err
	}
	return Success(c, "")
}

func (dbmAssetApi DBMAssetApi) DBMAssetPagingTreeEndpoint(c echo.Context) (err error) {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	protocol := c.QueryParam("protocol")
	tags := c.QueryParam("tags")
	ip := c.QueryParam("ip")
	port := c.QueryParam("port")
	active := c.QueryParam("active")

	order := c.QueryParam("order")
	field := c.QueryParam("field")

	items, total, err := repository.AssetRepository.Find(context.Background(), pageIndex, pageSize, name, protocol, tags, ip, port, active, order, field)
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

	return Success(c, maps.Map{
		"total": total,
		"items": menuItems,
	})
}
