package api

import (
	"bufio"
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"next-dbm/server/common/maps"
	"next-dbm/server/common/nd"
	"next-dbm/server/log"
	"next-dbm/server/model"
	"next-dbm/server/proxy"
	"next-dbm/server/repository"
	"next-dbm/server/service"
	"next-dbm/server/utils"

	"github.com/go-mysql-org/go-mysql/client"
	"github.com/go-mysql-org/go-mysql/mysql"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

type AssetApi struct{}

func (assetApi AssetApi) AssetTypeEndpoint(c echo.Context) error {
	return Success(c, model.AssetTypes)
}

func (assetApi AssetApi) AssetCreateEndpoint(c echo.Context) error {
	m := maps.Map{}
	if err := c.Bind(&m); err != nil {
		return err
	}

	account, _ := GetCurrentAccount(c)
	m["owner"] = account.ID

	if _, err := service.AssetService.Create(context.TODO(), m); err != nil {
		return err
	}
	//更新代理配置账号密码信息
	go proxy.Reload()
	return Success(c, nil)
}

func (assetApi AssetApi) AssetImportEndpoint(c echo.Context) error {
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

func (assetApi AssetApi) AssetPagingEndpoint(c echo.Context) error {
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

func (assetApi AssetApi) AssetAllEndpoint(c echo.Context) error {
	protocol := c.QueryParam("protocol")
	assets, err := repository.AssetRepository.FindByProtocol(context.TODO(), protocol)
	if err != nil {
		return err
	}
	items := make([]maps.Map, len(assets))
	for i, e := range assets {
		items[i] = maps.Map{
			"id":     e.ID,
			"name":   e.Name,
			"active": e.Active,
		}
	}
	return Success(c, items)
}

func (assetApi AssetApi) AssetUpdateEndpoint(c echo.Context) error {
	id := c.Param("id")
	m := maps.Map{}
	if err := c.Bind(&m); err != nil {
		return err
	}
	if err := service.AssetService.UpdateById(id, m); err != nil {
		return err
	}
	//更新代理配置账号密码信息
	go proxy.Reload()
	return Success(c, nil)
}

func (assetApi AssetApi) AssetDeleteEndpoint(c echo.Context) error {
	id := c.Param("id")
	split := strings.Split(id, ",")
	for i := range split {
		if err := service.AssetService.DeleteById(split[i]); err != nil {
			return err
		}
	}
	//更新代理配置账号密码信息
	go proxy.Reload()
	return Success(c, nil)
}

func (assetApi AssetApi) AssetGetEndpoint(c echo.Context) (err error) {
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

func (assetApi AssetApi) AssetTcpingEndpoint(c echo.Context) (err error) {
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

func (assetApi AssetApi) AssetTagsEndpoint(c echo.Context) (err error) {
	var items []string
	if items, err = repository.AssetRepository.FindTags(context.TODO()); err != nil {
		return err
	}
	return Success(c, items)
}

func (assetApi AssetApi) AssetChangeOwnerEndpoint(c echo.Context) (err error) {
	id := c.Param("id")

	owner := c.QueryParam("owner")
	if err := repository.AssetRepository.UpdateById(context.TODO(), &model.Asset{Owner: owner}, id); err != nil {
		return err
	}
	//更新代理配置账号密码信息
	go proxy.Reload()
	return Success(c, "")
}

func (assetApi AssetApi) AssetPagingTreeEndpoint(c echo.Context) (err error) {
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

func (assetApi AssetApi) GatewayEndpoint(c echo.Context) error {
	id := c.Param("id")
	account, _ := GetCurrentAccount(c)

	if account == nil {
		return errors.New("未登录")
	}

	// 管理员可以查看所有资产
	if account.Type == nd.TypeAdmin {
		log.Info("管理员查看资产")
		var items map[string]string
		items, err := repository.AssetRepository.GetAssetGatewayByID(id, account.ID)
		if err != nil {
			return err
		}
		// log.Info("检查用户", zap.Any(" items ", items))
		// log.Info("检查用户 username " + items["username"])
		isUsername, err := proxy.CheckUserNameAuth(items["username"], items["assetProtocol"])
		if err != nil {
			return err
		}
		if !isUsername {
			return Fail(c, 500, "用户 "+account.Username+" 没有权限,需要授权用户后重试")
		}
		return Success(c, items)
	} else {
		log.Info("用户查看资产")
		var items map[string]string
		items, err := service.WorkerService.GetAssetGatewayByID(id, account.ID)
		if err != nil {
			return err
		}
		isUsername, err := proxy.CheckUserNameAuth(items["username"], items["assetProtocol"])
		if err != nil {
			return err
		}
		if !isUsername {
			return Fail(c, 501, account.Username+"用户没有权限,需要授权用户后重试")
		}
		return Success(c, items)
	}

}
func (assetApi AssetApi) GatewayByUserIdEndpoint(c echo.Context) error {
	id := c.Param("id")
	userId := c.Param("userid")
	account, _ := GetCurrentAccount(c)

	if account == nil {
		return errors.New("未登录")
	}
	items, err := repository.AssetRepository.GetAssetGatewayByID(id, userId)
	if err != nil {
		return err
	}
	isUsername, err := proxy.CheckUserNameAuth(items["username"], items["assetProtocol"])
	if err != nil {
		return err
	}
	if !isUsername {
		return Fail(c, 500, account.Username+"用户没有权限,需要授权用户后重试")
	}
	return Success(c, items)
}
func (assetApi AssetApi) GetDatabasesEndpoint(c echo.Context) error {
	id := c.Param("id")
	account, _ := GetCurrentAccount(c)
	if account == nil {
		return errors.New("未登录")
	}
	var items map[string]string
	items, err := service.WorkerService.GetAssetGatewayByID(id, account.ID)
	if err != nil {
		return err
	}
	// log.Info("  连接信息 " + fmt.Sprintf("%s:%s", "localhost", items["proxyLocalPort"]))
	// log.Info("  用户名 " + items["username"])
	// log.Info("  密码 " + items["proxyAuth"])
	// 连接数据库 这里需要链接本地的代理端口不使用网关
	client, err := client.Connect(fmt.Sprintf("%s:%s", "localhost", items["proxyLocalPort"]), items["username"], items["proxyAuth"], "")
	if err != nil {
		log.Error("Error connecting to MySQL: ", log.String("err", err.Error()))
		return err
	}
	defer client.Close()

	// 发送命令
	command := "SHOW DATABASES"
	v, err := client.Execute(command)
	if err != nil {
		log.Error("Error writing to connection:", log.String("err", err.Error()))
		return err
	}
	// 转换执行SQL 返回数据为JOSN
	var result []string

	if v != nil && v.Resultset != nil {
		for _, row := range v.Values {
			// 提取每行的第一个字段
			if len(row) > 0 {
				firstValue := row[0]
				switch firstValue.Type {
				case mysql.FieldValueTypeString:
					result = append(result, string(firstValue.AsString()))
				default:
					result = append(result, fmt.Sprintf("%v", firstValue.Value()))
				}
			}
		}
	}

	return Success(c, result)
}

func (assetApi AssetApi) GetTablesEndpoint(c echo.Context) error {
	id := c.Param("id")
	database := c.Param("database")
	log.Info(" id  database ", zap.Any("id", id), zap.Any("database", database))
	account, _ := GetCurrentAccount(c)
	if account == nil {
		return errors.New("未登录")
	}
	// todo 验证最大连接数超出报错 返回

	var items map[string]string
	items, err := service.WorkerService.GetAssetGatewayByID(id, account.ID)
	if err != nil {
		return err
	}
	log.Info(" items ", zap.Any("items", items))
	// 连接数据库
	client, err := client.Connect(fmt.Sprintf("%s:%s", "localhost", items["proxyLocalPort"]), items["username"], items["proxyAuth"], "")
	if err != nil {
		log.Error("Error connecting to MySQL: ", log.String("err", err.Error()))
		return err
	}

	defer client.Close()

	// 发送命令
	command := "SELECT TABLE_NAME,TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + database + "';"
	v, err := client.Execute(command)
	if err != nil {
		log.Error("Error writing to connection:", log.String("err", err.Error()))
		return err
	}
	// 转换执行SQL 返回数据为JOSN
	// 转换执行 SQL 返回数据为 JSON 格式
	var jsonResult []map[string]string

	if v != nil && v.Resultset != nil {
		for _, row := range v.Values {
			// 提取每行的第一个字段
			if len(row) > 0 {
				firstValue := row[0]
				var name string
				switch firstValue.Type {
				case mysql.FieldValueTypeString:
					name = string(firstValue.AsString())
				default:
					name = fmt.Sprintf("%v", firstValue.Value())
				}

				value1 := row[1]
				var comment string
				switch value1.Type {
				case mysql.FieldValueTypeString:
					comment = string(value1.AsString())
				default:
					comment = fmt.Sprintf("%v", value1.Value())
				}
				// 将字段封装为 map
				jsonResult = append(jsonResult, map[string]string{
					"key":     name,
					"name":    name,
					"comment": comment,
				})
			}
		}
	}

	return Success(c, jsonResult)
}
