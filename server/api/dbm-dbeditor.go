package api

import (
	"context"
	"next-dbm/server/log"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/service"
	"next-dbm/server/utils"

	"github.com/labstack/echo/v4"
)

type DBEditor struct{}

func (dbe *DBEditor) getAllDataBases(c echo.Context) (err error) {
	// 通过资产ID获取资产信息
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

// 	dbConfig := &DBConfig{
// 	   Host:     item.IP,
// 	   Port:     item.Port,
// 	   User:     item.Username,
// 	   Pass:     item.Password, 
//    }

//    authMethod, err := NewDBClient(dbConfig)
//    if err != nil {
// 	   return nil, err
//    }
//    return authMethod, nil


   log.Error("Error unmarshalling JSON data:")
   return Success(c, itemMap)
   
}
func (dbe *DBEditor) getAllTables(c echo.Context) (err error) {
	// 通过资产ID获取资产信息
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

// 	dbConfig := &DBConfig{
// 	   Host:     item.IP,
// 	   Port:     item.Port,
// 	   User:     item.Username,
// 	   Pass:     item.Password, 
//    }

//    authMethod, err := NewDBClient(dbConfig)
//    if err != nil {
// 	   return nil, err
//    }
//    return authMethod, nil


   log.Error("Error unmarshalling JSON data:")
   return Success(c, itemMap)
   
}


// SQL 执行
func (dbe *DBEditor) ExecSQL(c echo.Context) (err error) {
	ws, err := UpGrader.Upgrade(c.Response().Writer, c.Request(), nil)
	if err != nil {
		return err
	}
	
	defer ws.Close()
	return Success(c, "")
}

