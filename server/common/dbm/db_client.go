package dbm

import (
	"bufio"
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"next-dbm/server/common"
	"next-dbm/server/config"
	"next-dbm/server/log"

	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"

	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/denisenkom/go-mssqldb" // SQL Server
	"golang.org/x/crypto/ssh"

	// _ "github.com/elastic/go-elasticsearch/v7" // Elasticsearch
	"github.com/go-redis/redis"        // Redis
	_ "github.com/go-sql-driver/mysql" // MySQL

	// _ "github.com/gocql/gocql"                 // Cassandra
	_ "github.com/lib/pq"           // PostgreSQL
	_ "github.com/mattn/go-sqlite3" // SQLite
	"gopkg.in/mgo.v2"               // MongoDB (for previous versions)
)

// 管道处理逻辑

type goroutinePool struct {
	done chan struct{}
}

func newGoroutinePool() *goroutinePool {
	return &goroutinePool{
		done: make(chan struct{}),
	}
}

func (p *goroutinePool) Stop() {
	close(p.done)
}

// DBConfig 用于配置不同数据库的连接信息
type DBConfig struct {
	DBType string
	Host   string
	Port   int
	User   string
	Pass   string
	DBName string
	Params string
	URI    string // 对于某些数据库（如Redis和MongoDB），可以直接使用URI

	clientConn ssh.Conn
	channels   <-chan ssh.NewChannel
	requests   <-chan *ssh.Request
}

// DBUtil 是一个通用的数据库操作工具类
type DBClient struct {
	dbConfig *DBConfig
	session  *DBSession
}
type DBSession struct {
	// SessionId string 暂时不使用
	Session *model.Session
	DB      *sql.DB       // 用于SQL数据库
	RedisDB *redis.Client // 用于Redis
	MongoDB *mgo.Session  // 用于MongoDB

	DBType            string // 数据库类型
	Stdin             io.Reader
	Stdout            io.Writer
	Stderr            io.Writer
	stdinPipeListener *goroutinePool
}

// 假设这是要接收的 JSON 数据类型
type Message struct {
	Key     string      `json:"key"`
	RetType string      `json:"retType"`
	Db      string      `json:"db"`
	Data    interface{} `json:"data"`
	Code    int         `json:"code"`
	Msg     string      `json:"msg"`
	Attr    interface{} `json:"attr"`
}

func (s *DBSession) startStdinPipeListener() {
	s.stdinPipeListener = newGoroutinePool()
	go func() {
		defer s.stdinPipeListener.Stop()
		buf := make([]byte, 1024)
		var accumulatedData bytes.Buffer
		for {
			select {
			case <-s.stdinPipeListener.done:
				return
			default:
				n, err := s.Stdin.Read(buf)
				if err == io.EOF {
					if accumulatedData.Len() > 0 {
						err := s.handleJSONData(&accumulatedData)
						if err != nil {
							log.Error("Error handling JSON data:", log.NamedError("err", err))
						}
					}
					return
				}
				if err != nil {
					log.Error("Error reading from stdin pipe:", log.NamedError("err", err))
					return
				}
				// 将新读取的数据追加到累积的缓冲区
				accumulatedData.Write(buf[:n])
				// 检查是否已经接收到完整的 JSON 数据
				if s.isCompleteJSON(accumulatedData.Bytes()) {
					err := s.handleJSONData(&accumulatedData)
					if err != nil {
						log.Error("Error handling JSON data:", log.NamedError("err", err))
					}
					accumulatedData.Reset() // 清空缓冲区
				}
			}
		}
	}()
}

// 检查缓冲区中的数据是否是完整的 JSON 数据
func (s *DBSession) isCompleteJSON(data []byte) bool {
	var result map[string]interface{}
	return json.Unmarshal(data, &result) == nil
}

// 处理 JSON 数据
func (s *DBSession) handleJSONData(buf *bytes.Buffer) error {
	var message Message
	message.Code = 0
	message.Msg = "成功"

	if err := json.Unmarshal(buf.Bytes(), &message); err != nil {
		log.Error("Error unmarshalling JSON data:", log.NamedError("err", err))
		return err
	}
	log.Info("### Received JSON data: ", log.String("message", message.Key))

	// 将 message.Data 转换成字符串
	dataStr, err := json.Marshal(message.Data)
	if err != nil {
		log.Error("Error marshalling JSON data:", log.NamedError("err", err))
		return err
	}

	// 转换成字符串
	ttStr := string(dataStr)
	log.Info("### Received JSON data as string: ", log.String("ttStr", ttStr))

	// 提取 SQL 语句
	var sqlQuery string
	if err := json.Unmarshal([]byte(ttStr), &sqlQuery); err != nil {
		log.Error("Error unmarshalling SQL query:", log.NamedError("err", err))
		return err
	}
	log.Info("ttStr: ", log.String("sqlQuery", sqlQuery))

	// 获取session信息打印
	sqlLogObj := &model.SqlLog{
		ID:         utils.UUID(),
		Owner:      s.Session.Creator,
		AssetId:    s.Session.AssetId,
		SqlCommand: sqlQuery,
		Created:    common.NowJsonTime(),
		SessionId:  s.Session.ID,
	}

	switch message.RetType {
	case "importDatabaseJsonResult":
		{
			// 获取Attr 信息打印
			log.Info(" ### Attr: ", log.String("Attr", fmt.Sprintf("%v", message.Attr)))
			attrMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}
			// 获取特定键的值
			database, ok := attrMap["database"]
			if ok {
				log.Info("database:", log.Any("database", database))
			}
			fileName, ok := attrMap["fileName"]
			if ok {
				log.Info("fileName:", log.Any("fileName", fileName))
			}
			filePath, ok := attrMap["filePath"]
			if ok {
				log.Info("filePath:", log.Any("filePath", filePath))
			}
			message.Data = "ok"
			// 获取基本目录
			drivePath := config.GlobalCfg.Guacd.Drive
			log.Info("drivePath:", log.String("drivePath", drivePath))

			storageId, ok := attrMap["storageId"]
			if ok {
				log.Info("storageId:", log.Any("storageId", storageId))
			}

			// 判断文件夹不存在时自动创建
			dir := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string), fileName.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}

			targetDir := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string))
			if !utils.FileExists(targetDir) {
				if err := os.MkdirAll(targetDir, os.ModePerm); err != nil {
					return err
				}
			}
			sourceZip := dir // 需要压缩的目录路径
			log.Info(" sourceZip ", log.Any("sourceZip", sourceZip))
			log.Info(" targetDir ", log.Any("targetDir", targetDir))

			err = utils.Unzip(sourceZip, targetDir)
			if err != nil {
				panic(err)
			}
			// 设置要使用的数据库
			setUseDbSql := ""
			if s.DBType == "MySQL" || s.DBType == "MariaDB" {
				setUseDbSql = fmt.Sprintf("USE `%s`", database)
			} else if s.DBType == "PostgreSQL" {
				setUseDbSql = fmt.Sprintf("SET search_path TO %s", database)
			}
			_, err := s.DB.Exec(setUseDbSql)
			if err != nil {
				log.Error("无法选择数据库: ", log.NamedError("err", err))
			}
			// 开启事务
			tx, err := s.DB.Begin()
			if err != nil {
				log.Fatal("无法开启事务: ", log.NamedError("err", err))
			}
			// 定义一个标志来跟踪事务是否已回滚或提交
			var txCompleted bool

			// 遍历目录
			err = filepath.Walk(targetDir, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return err
				}
				// 过滤出 .sql 文件
				if !info.IsDir() && filepath.Ext(path) == ".sql" {
					fmt.Println("正在处理文件:", path)

					// 假设 sqlQuery 从文件中读取到的 SQL 查询
					sqlQuery, err = utils.ReadFile(path)
					if err != nil {
						log.Fatal("读取 SQL 文件时发生错误: ", log.NamedError("err", err))
						message.Code = -1
						message.Msg = err.Error()
						messageJSON, _ := json.Marshal(message)
						s.Stdout.Write(messageJSON)
						return err
					}

					// 执行SQL
					_, err := tx.Exec(sqlQuery)
					if err != nil {
						log.Error("执行 SQL 时发生错误: ", log.NamedError("err", err))
						if !txCompleted {
							// 如果 SQL 执行失败，回滚事务
							if rollbackErr := tx.Rollback(); rollbackErr != nil {
								log.Fatal("回滚事务时发生错误: ", log.NamedError("rollbackErr", rollbackErr))
							}
							txCompleted = true
						}

						message.Code = -1
						message.Msg = err.Error()
						messageJSON, _ := json.Marshal(message)
						s.Stdout.Write(messageJSON)
						// 返回错误以停止遍历
						return err
					}
				}

				return nil
			})

			// 如果遍历目录时发生错误，回滚事务
			if err != nil {
				log.Error("遍历目录时发生错误: ", log.NamedError("err", err))
				if !txCompleted {
					if rollbackErr := tx.Rollback(); rollbackErr != nil {
						log.Fatal("回滚事务时发生错误: ", log.NamedError("rollbackErr", rollbackErr))
					}
				}
				return err
			}

			// 如果没有错误，提交事务
			if err = tx.Commit(); err != nil {
				log.Fatal("提交事务时发生错误: ", log.NamedError("err", err))
			}

			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}
			s.Stdout.Write(messageJSON)
		}
	case "exportDatabaseOnlyStructJsonResult":
		{
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}

				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			allTablesJson, err := utils.RowsToTablesArray(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = "ok"
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}

			// 获取Attr 信息打印
			log.Info(" ### Attr: ", log.String("Attr", fmt.Sprintf("%v", message.Attr)))
			attrMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}

			// 获取特定键的值
			database, ok := attrMap["database"]
			if ok {
				log.Info("database:", log.Any("database", database))
			}
			fileName, ok := attrMap["fileName"]
			if ok {
				log.Info("fileName:", log.Any("fileName", fileName))
			}
			filePath, ok := attrMap["filePath"]
			if ok {
				log.Info("filePath:", log.Any("filePath", filePath))
			}

			// 获取基本目录
			drivePath := config.GlobalCfg.Guacd.Drive
			log.Info("drivePath:", log.String("drivePath", drivePath))

			storageId, ok := attrMap["storageId"]
			if ok {
				log.Info("storageId:", log.Any("storageId", storageId))
			}

			// 判断文件夹不存在时自动创建
			dir := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}

			targetDir := path.Join(path.Join(drivePath, storageId.(string)), "/export/", fileName.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}
			// 根据查询接口key创建表文件
			for _, tableName := range allTablesJson {
				log.Info(" tableName: %s", log.Any("tableName", tableName))
				tableDDlSqlStr := fmt.Sprintf("SHOW CREATE TABLE `%s`.`%s`", database, tableName)
				tableDDLRows, err := s.DB.Query(tableDDlSqlStr)
				if err != nil {
					log.Error("", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
				defer tableDDLRows.Close()

				tableDDLJson, err := utils.RowsToKeyValueJson(tableDDLRows)
				if err != nil {
					log.Error("处理行数据失败: ", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}

				// 根据查询接口key创建表文件
				for key, value := range tableDDLJson {
					log.Info("Key: %s, Value: %s", log.Any("key", key), log.Any("value", value))
					// 新建文件 将 keyValueJson 数据保存到文件中
					file, err := os.Create(path.Join(path.Join(drivePath, storageId.(string)), filePath.(string), key+"-struct.sql"))
					if err != nil {
						return err
					}
					defer file.Close()
					if _, err := file.WriteString(string(tableDDLJson[key])); err != nil {
						return err
					}
				}
			}
			sourceDir := dir       // 需要压缩的目录路径
			targetZip := targetDir // 目标 ZIP 文件路径

			err = utils.ZipDir(sourceDir, targetZip)
			if err != nil {
				panic(err)
			}
			//  移动文件到指定目录
			err = utils.MoveFile(targetZip, dir)
			if err != nil {
				panic(err)
			}
			println("目录打包成功:", targetZip)

			s.Stdout.Write(messageJSON)
		}
	case "exportDatabaseStructDataJsonResult":
		{
			// 查询结构语句
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))
				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}

				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			allTablesJson, err := utils.RowsToTablesArray(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = "ok"
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}

			// 获取Attr 信息打印
			log.Info(" ### Attr: ", log.String("Attr", fmt.Sprintf("%v", message.Attr)))
			attrMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}

			// 获取特定键的值
			database, ok := attrMap["database"]
			if ok {
				log.Info("database:", log.Any("database", database))
			}
			fileName, ok := attrMap["fileName"]
			if ok {
				log.Info("fileName:", log.Any("fileName", fileName))
			}
			filePath, ok := attrMap["filePath"]
			if ok {
				log.Info("filePath:", log.Any("filePath", filePath))
			}

			// 获取基本目录
			drivePath := config.GlobalCfg.Guacd.Drive
			log.Info("drivePath:", log.String("drivePath", drivePath))

			storageId, ok := attrMap["storageId"]
			if ok {
				log.Info("storageId:", log.Any("storageId", storageId))
			}

			// 判断文件夹不存在时自动创建
			dir := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}

			targetDir := path.Join(path.Join(drivePath, storageId.(string)), "/export/", fileName.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}
			// 根据查询接口key创建表文件
			for _, tableName := range allTablesJson {
				log.Info(" tableName: %s", log.Any("tableName", tableName))
				tableDDlSqlStr := fmt.Sprintf("SHOW CREATE TABLE `%s`.`%s`", database, tableName)
				tableDDLRows, err := s.DB.Query(tableDDlSqlStr)
				if err != nil {
					log.Error("", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
				defer tableDDLRows.Close()

				tableDDLJson, err := utils.RowsToKeyValueJson(tableDDLRows)
				if err != nil {
					log.Error("处理行数据失败: ", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}

				// 根据查询接口key创建表文件
				for key, value := range tableDDLJson {
					log.Info("Key: %s, Value: %s", log.Any("key", key), log.Any("value", value))
					// 新建文件 将 keyValueJson 数据保存到文件中
					file, err := os.Create(path.Join(path.Join(drivePath, storageId.(string)), filePath.(string), key+"-struct.sql"))
					if err != nil {
						return err
					}
					defer file.Close()
					if _, err := file.WriteString(string(tableDDLJson[key])); err != nil {
						return err
					}
				}

				// 导出数据库数据
				var totalRows int64 // 定义一个变量来存储查询结果

				tableFormat := fmt.Sprintf("`%s` ", tableName)
				databaseTableName := fmt.Sprintf("`%s`.`%s` ", database, tableName)
				sqlQuery := fmt.Sprintf("SELECT * FROM %s ", databaseTableName)
				log.Info(" sqlQuery :", log.Any("sqlQuery", sqlQuery))
				sumCountSql := fmt.Sprintf("SELECT count(*) FROM (%s) AS subquery ", sqlQuery)
				log.Info(" sumCountSql :", log.Any("sumCountSql", sumCountSql))
				countRows, err := s.DB.Query(sumCountSql)
				if err != nil {
					log.Error("", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
				defer countRows.Close()

				// 遍历查询结果
				if countRows.Next() {
					err = countRows.Scan(&totalRows)
					if err != nil {
						log.Error("", log.NamedError("err", err))
						message.Code = -1
						message.Msg = err.Error()
						messageJSON, _ := json.Marshal(message)
						s.Stdout.Write(messageJSON)
						return err
					}
				} else {
					// 没有数据的情况
					totalRows = 0
				}

				// 构建分页 SQL 查询
				pageSize := 100000
				currentPage := 1
				// 计算总页数
				totalPages := (int64(totalRows) + int64(pageSize) - 1) / int64(pageSize)
				for int64(currentPage) <= totalPages {

					pageSql := fmt.Sprintf("SELECT * FROM (%s) AS subquery LIMIT %d OFFSET %d", sqlQuery, int(pageSize), (int(currentPage)-1)*int(pageSize))
					log.Info(" pageSql str :", log.Any("pageSql", pageSql))
					dataRows, err := s.DB.Query(pageSql)
					if err != nil {
						log.Error("", log.NamedError("err", err))
						message.Code = -1
						message.Msg = err.Error()
						messageJSON, _ := json.Marshal(message)
						s.Stdout.Write(messageJSON)
						return err
					}
					defer dataRows.Close()
					jsonResult, err := utils.RowsToInsertStatements(dataRows, tableFormat)
					if err != nil {
						log.Error("处理行数据失败: ", log.NamedError("err", err))
						message.Code = -1
						message.Msg = err.Error()
						messageJSON, _ := json.Marshal(message)
						s.Stdout.Write(messageJSON)
						return err
					}
					fullPath := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string), tableName+"-data.sql")
					file, err := os.OpenFile(fullPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
					if err != nil {
						return err
					}
					defer file.Close()

					if _, err := file.WriteString(jsonResult); err != nil {
						return err
					}
					currentPage++
				}
			}

			sourceDir := dir       // 需要压缩的目录路径
			targetZip := targetDir // 目标 ZIP 文件路径

			err = utils.ZipDir(sourceDir, targetZip)
			if err != nil {
				panic(err)
			}
			//  移动文件到指定目录
			err = utils.MoveFile(targetZip, dir)
			if err != nil {
				panic(err)
			}
			println("目录打包成功:", targetZip)

			s.Stdout.Write(messageJSON)
		}

	case "exportTableOnlyStructJsonResult":
		{
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}

				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			keyValueJson, err := utils.RowsToKeyValueJson(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = keyValueJson
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}

			// 获取Attr 信息打印
			log.Info(" ### Attr: ", log.String("Attr", fmt.Sprintf("%v", message.Attr)))
			attrMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}

			// 获取特定键的值
			fileName, ok := attrMap["fileName"]
			if ok {
				log.Info("fileName:", log.Any("fileName", fileName))
			}
			filePath, ok := attrMap["filePath"]
			if ok {
				log.Info("filePath:", log.Any("filePath", filePath))
			}

			// 获取基本目录
			drivePath := config.GlobalCfg.Guacd.Drive
			log.Info("drivePath:", log.String("drivePath", drivePath))

			storageId, ok := attrMap["storageId"]
			if ok {
				log.Info("storageId:", log.Any("storageId", storageId))
			}

			// 判断文件夹不存在时自动创建
			dir := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}

			targetDir := path.Join(path.Join(drivePath, storageId.(string)), "/export/", fileName.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}
			// 根据查询接口key创建表文件
			for key, value := range keyValueJson {
				log.Info("Key: %s, Value: %s", log.Any("key", key), log.Any("value", value))
				// 新建文件 将 keyValueJson 数据保存到文件中
				file, err := os.Create(path.Join(path.Join(drivePath, storageId.(string)), filePath.(string), key+"-struct.sql"))
				if err != nil {
					return err
				}
				defer file.Close()

				if _, err := file.WriteString(string(keyValueJson[key])); err != nil {
					return err
				}

			}
			sourceDir := dir       // 需要压缩的目录路径
			targetZip := targetDir // 目标 ZIP 文件路径

			err = utils.ZipDir(sourceDir, targetZip)
			if err != nil {
				panic(err)
			}
			//  移动文件到指定目录
			err = utils.MoveFile(targetZip, dir)
			if err != nil {
				panic(err)
			}
			println("目录打包成功:", targetZip)

			s.Stdout.Write(messageJSON)
		}
	case "exportTableStructDataJsonResult":
		{
			// 查询结构语句
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))
				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			keyValueJson, err := utils.RowsToKeyValueJson(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = keyValueJson
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}

			// 获取Attr 信息打印
			log.Info(" ### Attr: ", log.String("Attr", fmt.Sprintf("%v", message.Attr)))
			attrMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}

			// 获取特定键的值
			fileName, ok := attrMap["fileName"]
			if ok {
				log.Info("fileName:", log.Any("fileName", fileName))
			}
			filePath, ok := attrMap["filePath"]
			if ok {
				log.Info("filePath:", log.Any("filePath", filePath))
			}

			// 获取基本目录
			drivePath := config.GlobalCfg.Guacd.Drive
			log.Info("drivePath:", log.String("drivePath", drivePath))

			storageId, ok := attrMap["storageId"]
			if ok {
				log.Info("storageId:", log.Any("storageId", storageId))
			}

			// 判断文件夹不存在时自动创建
			dir := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}

			targetDir := path.Join(path.Join(drivePath, storageId.(string)), "/export/", fileName.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}
			// 根据查询接口key创建表文件
			for key, value := range keyValueJson {
				log.Info("Key: %s, Value: %s", log.Any("key", key), log.Any("value", value))
				// 新建文件 将 keyValueJson 数据保存到文件中
				file, err := os.Create(path.Join(path.Join(drivePath, storageId.(string)), filePath.(string), key+"-struct.sql"))
				if err != nil {
					return err
				}
				defer file.Close()

				if _, err := file.WriteString(string(keyValueJson[key])); err != nil {
					return err
				}
			}

			// 导出数据库数据
			var totalRows int64 // 定义一个变量来存储查询结果

			database, ok := attrMap["database"]
			if ok {
				log.Info("database:", log.Any("database", database))
			}
			table, ok := attrMap["table"]
			if ok {
				log.Info("table:", log.Any("table", table))
			}
			tableFormat := fmt.Sprintf("`%s` ", table)
			databaseTableName := fmt.Sprintf("`%s`.`%s` ", database, table)
			sqlQuery := fmt.Sprintf("SELECT * FROM %s ", databaseTableName)
			log.Info(" sqlQuery :", log.Any("sqlQuery", sqlQuery))
			sumCountSql := fmt.Sprintf("SELECT count(*) FROM (%s) AS subquery ", sqlQuery)
			log.Info(" sumCountSql :", log.Any("sumCountSql", sumCountSql))
			countRows, err := s.DB.Query(sumCountSql)
			if err != nil {
				log.Error("", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer countRows.Close()

			// 遍历查询结果
			if countRows.Next() {
				err = countRows.Scan(&totalRows)
				if err != nil {
					log.Error("", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
			} else {
				// 没有数据的情况
				totalRows = 0
			}

			// 构建分页 SQL 查询
			pageSize := 100000
			currentPage := 1
			// 计算总页数
			totalPages := (int64(totalRows) + int64(pageSize) - 1) / int64(pageSize)
			for int64(currentPage) <= totalPages {

				pageSql := fmt.Sprintf("SELECT * FROM (%s) AS subquery LIMIT %d OFFSET %d", sqlQuery, int(pageSize), (int(currentPage)-1)*int(pageSize))
				log.Info(" pageSql str :", log.Any("pageSql", pageSql))
				dataRows, err := s.DB.Query(pageSql)
				if err != nil {
					log.Error("", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
				defer dataRows.Close()
				jsonResult, err := utils.RowsToInsertStatements(dataRows, tableFormat)
				if err != nil {
					log.Error("处理行数据失败: ", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
				fullPath := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string), table.(string)+"-data.sql")
				file, err := os.OpenFile(fullPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
				if err != nil {
					return err
				}
				defer file.Close()

				if _, err := file.WriteString(jsonResult); err != nil {
					return err
				}
				currentPage++
			}
			sourceDir := dir       // 需要压缩的目录路径
			targetZip := targetDir // 目标 ZIP 文件路径

			err = utils.ZipDir(sourceDir, targetZip)
			if err != nil {
				panic(err)
			}
			//  移动文件到指定目录
			err = utils.MoveFile(targetZip, dir)
			if err != nil {
				panic(err)
			}
			println("目录打包成功:", targetZip)

			s.Stdout.Write(messageJSON)
		}
	case "KeyValueJsonResult":
		{
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			keyValueJson, err := utils.RowsToKeyValueJson(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			message.Data = keyValueJson
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}
			s.Stdout.Write(messageJSON)
		}
	case "executeResult":
		{
			attrDatabaseMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}
			// 获取特定键的值
			database, ok := attrDatabaseMap["database"]
			if ok {
				log.Info("database:", log.Any("database", database))
			}
			// 设置要使用的数据库
			setUseDbSql := fmt.Sprintf("USE %s", database)
			_, err := s.DB.Exec(setUseDbSql)
			if err != nil {
				log.Error("executeResult 无法选择数据库: ", log.NamedError("err", err))
			}

			result, err := s.DB.Exec(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}

				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			message.Data = result
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}
			s.Stdout.Write(messageJSON)
		}
	case "tableRsesult":
		{
			tx, err := s.DB.Begin()
			if err != nil {
				log.Error("无法开启事务", log.Any("err", err))
				return err
			}
			attrDatabaseMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}
			// 获取特定键的值
			database, ok := attrDatabaseMap["database"]
			if ok {
				log.Info("database:", log.Any("database", database))
			}

			// 设置要使用的数据库
			setUseDbSql := ""
			if s.DBType == "MySQL" || s.DBType == "MariaDB" {
				setUseDbSql = fmt.Sprintf("USE `%s`", database)
			} else if s.DBType == "PostgreSQL" {
				setUseDbSql = fmt.Sprintf("SET search_path TO %s", database)
			}
			_, err = tx.Exec(setUseDbSql)
			if err != nil {
				log.Error("tableRsesult 无法选择数据库: ", log.NamedError("err", err))
			}
			// 分页查询处理
			// 删除最后一个分号
			sqlQuery = strings.TrimSuffix(sqlQuery, ";")

			var totalRows int64 // 定义一个变量来存储查询结果
			attrData, _ := message.Attr.(map[string]interface{})
			pageSize := attrData["pageSize"].(float64) // 如果 JSON 解码后的数字类型是 float64
			currentPage := attrData["currentPage"].(float64)
			log.Info("PageSize:", log.Any("pageSize", int(pageSize)))
			log.Info("CurrentPage:", log.Any("CurrentPage", int(currentPage)))

			sumCountSql := fmt.Sprintf("SELECT count(*) FROM (%s) AS subquery ", sqlQuery)
			countRows, err := tx.Query(sumCountSql)
			if err != nil {
				log.Error("", log.NamedError("err", err))
				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer countRows.Close()
			tx.Commit()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}
			// 遍历查询结果
			if countRows.Next() {
				err = countRows.Scan(&totalRows)
				if err != nil {
					log.Error("", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
			} else {
				// 没有数据的情况
				totalRows = 0
			}
			// 将 Attr 断言为 map[string]interface{}
			attrMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				attrMap = make(map[string]interface{})
			}
			// 更新 totalRows 属性
			attrMap["totalRows"] = totalRows
			// 将更新后的 map 赋值回 Attr 字段
			message.Attr = attrMap
			// 构建分页 SQL 查询
			pageSql := fmt.Sprintf("SELECT * FROM (%s) AS subquery LIMIT %d OFFSET %d", sqlQuery, int(pageSize), (int(currentPage)-1)*int(pageSize))
			log.Info(" pageSql str :", log.Any("pageSql", pageSql))
			rows, err := s.DB.Query(pageSql)
			if err != nil {
				log.Error("", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()
			jsonResult, err := utils.RowsToJSONArray(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = jsonResult
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}

			// 输出 JSON 数据
			s.Stdout.Write(messageJSON)
		}
	case "tableStruct":
		{
			// 分页查询处理
			// 删除最后一个分号
			sqlQuery = strings.TrimSuffix(sqlQuery, ";")

			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))
				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			jsonResult, err := utils.RowsToJSONArray(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = jsonResult
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}

			// 输出 JSON 数据
			s.Stdout.Write(messageJSON)
		}
	case "databaseMenu":
		{
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}

				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			// 调用 processRows 函数处理 rows 对象
			menuItems, err := utils.RowsToMenuJson(rows, message.Key, "databaseMenu", message.Attr)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = menuItems
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}
			log.Info("### Received JSON data as len : ", log.Int("len", len(messageJSON)))
			// 输出 JSON 数据
			s.Stdout.Write(messageJSON)
		}

	case "tablesMenu", "viewsMenu", "functionsMenu", "proceduresMenu", "keysMenu", "indexsMenu", "sqlsMenu":
		{
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}

				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			// 调用 processRows 函数处理 rows 对象
			menuItems, err := utils.RowsToMenuJson(rows, message.Key, message.RetType, message.Attr)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = menuItems
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}
			// 输出 JSON 数据
			s.Stdout.Write(messageJSON)
		}
	case "columnsMenu":
		{
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))
				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			// 调用 processRows 函数处理 rows 对象
			menuItems, err := utils.RowsToMenuJson(rows, message.Key, "columnsMenu", message.Attr)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = menuItems
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}
			// 输出 JSON 数据
			s.Stdout.Write(messageJSON)
		}
	case "erJsonResult":
		{
			rows, err := s.DB.Query(sqlQuery)
			if err != nil {
				log.Error("", log.NamedError("err", err))

				sqlLogObj.State = "0"
				sqlLogObj.Reason = err.Error()
				if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
					log.Error("sqlLog", log.NamedError("err", err))
				}

				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}
			defer rows.Close()

			sqlLogObj.State = "1"
			sqlLogObj.Reason = "成功"
			if err := repository.SqlLogRepository.Create(context.Background(), sqlLogObj); err != nil {
				log.Error("sqlLog", log.NamedError("err", err))
			}

			allTablesJson, err := utils.RowsToTablesArray(rows)
			if err != nil {
				log.Error("处理行数据失败: ", log.NamedError("err", err))
				message.Code = -1
				message.Msg = err.Error()
				messageJSON, _ := json.Marshal(message)
				s.Stdout.Write(messageJSON)
				return err
			}

			message.Data = "ok"
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Error("Failed to marshal message: ", log.NamedError("err", err))
				return err
			}

			// 获取Attr 信息打印
			log.Info(" ### Attr: ", log.String("Attr", fmt.Sprintf("%v", message.Attr)))
			attrMap, ok := message.Attr.(map[string]interface{})
			if !ok {
				log.Error("Failed to convert Attr to map")
			}

			// 获取特定键的值
			database, ok := attrMap["database"]
			if ok {
				log.Info("database:", log.Any("database", database))
			}
			fileName, ok := attrMap["fileName"]
			if ok {
				log.Info("fileName:", log.Any("fileName", fileName))
			}
			filePath, ok := attrMap["filePath"]
			if ok {
				log.Info("filePath:", log.Any("filePath", filePath))
			}

			// 获取基本目录
			drivePath := config.GlobalCfg.Guacd.Drive
			log.Info("drivePath:", log.String("drivePath", drivePath))

			storageId, ok := attrMap["storageId"]
			if ok {
				log.Info("storageId:", log.Any("storageId", storageId))
			}

			// 判断文件夹不存在时自动创建
			dir := path.Join(path.Join(drivePath, storageId.(string)), filePath.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}

			targetDir := path.Join(path.Join(drivePath, storageId.(string)), "/export/", fileName.(string))
			if !utils.FileExists(dir) {
				if err := os.MkdirAll(dir, os.ModePerm); err != nil {
					return err
				}
			}

			// 以「追加 + 不存在则创建」方式打开
			file, err := os.OpenFile(
				targetDir,
				os.O_CREATE|os.O_WRONLY|os.O_APPEND,
				0644,
			)
			if err != nil {
				return err
			}
			defer file.Close()
			sql := ""
			// 根据查询接口key创建表文件
			for _, tableName := range allTablesJson {
				log.Info(" tableName: %s", log.Any("tableName", tableName))
				tableDDlSqlStr := fmt.Sprintf("SHOW CREATE TABLE `%s`.`%s`", database, tableName)
				tableDDLRows, err := s.DB.Query(tableDDlSqlStr)
				if err != nil {
					log.Error("", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}
				defer tableDDLRows.Close()

				tableDDLJson, err := utils.RowsToKeyValueJson(tableDDLRows)
				if err != nil {
					log.Error("处理行数据失败: ", log.NamedError("err", err))
					message.Code = -1
					message.Msg = err.Error()
					messageJSON, _ := json.Marshal(message)
					s.Stdout.Write(messageJSON)
					return err
				}

				// 根据查询接口key创建表文件
				for key, value := range tableDDLJson {
					log.Info("Key: %s, Value: %s", log.Any("key", key), log.Any("value", value))
					sql += value + "\r\n"
					// // 写 SQL 内容
					// if _, err := file.WriteString(string(value)); err != nil {
					// 	return err
					// }

					// // 保证每个表之间有空行
					// if _, err := file.WriteString("\n\n"); err != nil {
					// 	return err
					// }
				}
			}
			// ER->JSON

			//  移动文件到指定目录
			err = utils.MoveFile(targetDir, dir)
			if err != nil {
				panic(err)
			}
			println("目录打包成功:", targetDir)

			s.Stdout.Write(messageJSON)
		}
	}

	return nil
	// 返回到前端
	// s.Stdout.Write(buf.Bytes())
}

func NewDBClient(dbConfig *DBConfig) (*DBClient, error) {
	return &DBClient{dbConfig: dbConfig}, nil
}

func (d *DBClient) SetUser(dbType string) (*DBClient, error) {
	d.dbConfig.DBType = dbType
	return d, nil
}
func (d *DBClient) SetUrl(url string) (*DBClient, error) {
	d.dbConfig.URI = url
	return d, nil
}

func (d *DBClient) SetParams(params string) (*DBClient, error) {
	d.dbConfig.Params = params
	return d, nil
}

// NewDBClient 创建一个新的DBUtil实例
func (d *DBClient) NewSession() (*DBSession, error) {
	dbSession := &DBSession{}
	var err error
	fmt.Println(" ### d.dbConfig.DBType " + d.dbConfig.DBType)
	switch d.dbConfig.DBType {

	case "MariaDB":
		fmt.Println(" ### d.dbConfig.DBType d.getConfigString() " + d.getConfigString())
		// 连接MySQL数据库
		dbSession.DB, err = sql.Open("mysql", d.getConfigString())
		if err != nil {
			log.Error("Failed to connect to MariaDB: ", log.NamedError("err", err))
			return nil, err
		}

	default:
		return nil, fmt.Errorf("不支持的数据库类型: %s", d.dbConfig.DBType)
	}

	if err != nil {
		return nil, err
	}

	d.session = dbSession
	return dbSession, nil
}

// getConfigString 为SQL数据库创建连接字符串
func (d *DBClient) getConfigString() string {
	cfg := d.dbConfig

	switch strings.ToLower(cfg.DBType) {
	case "mysql", "mariadb":
		return fmt.Sprintf("%s:%s@tcp(%s:%d)/",
			cfg.User, cfg.Pass, cfg.Host, cfg.Port)

	case "sqlserver":
		return fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d;database=%s;",
			cfg.Host, cfg.User, cfg.Pass, cfg.Port, cfg.DBName)

	case "elasticsearch":
		return fmt.Sprintf("http://%s:%d", cfg.Host, cfg.Port)

	case "redis", "cassandra":
		return fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)

	case "mongodb":
		return fmt.Sprintf("mongodb://%s:%s@%s:%d/%s",
			cfg.User, cfg.Pass, cfg.Host, cfg.Port, cfg.DBName)

	case "sqlite":
		return cfg.DBName

	case "postgresql", "postgres":
		return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
			cfg.User, cfg.Pass, cfg.Host, cfg.Port, cfg.DBName)

	default:
		return fmt.Sprintf("未定义数据类型: %s", cfg.DBType)
	}
}

// 后前后端通讯管道
func (s *DBSession) StdinPipe() (io.WriteCloser, error) {
	// 创建管道
	r, w := io.Pipe()
	s.Stdin = r
	s.startStdinPipeListener()
	// 返回写端
	return w, nil
}

func (s *DBSession) StdoutPipe() (*bufio.Reader, error) {
	// 创建管道
	r, w := io.Pipe()
	s.Stdout = w
	// 使用 bufio 包装读端
	reader := bufio.NewReader(r)

	// 返回 reader
	return reader, nil
}

// ExecuteSQL 执行SQL语句
func (s *DBSession) ExecuteSQL(query string, args ...interface{}) (sql.Result, error) {
	if s.DB != nil {
		return s.DB.Exec(query, args...)
	}
	return nil, fmt.Errorf("数据库连接未初始化")
}

// QuerySQL 查询SQL语句
func (s *DBSession) QuerySQL(query string, args ...interface{}) (*sql.Rows, error) {
	if s.DB != nil {
		return s.DB.Query(query, args...)
	}
	return nil, fmt.Errorf("数据库连接未初始化")
}

// RedisSet 设置Redis键值对
func (s *DBSession) RedisSet(key string, value interface{}, expiration time.Duration) error {
	if s.RedisDB != nil {
		err := s.RedisDB.Set(key, value, expiration).Err()
		return err
	}
	return fmt.Errorf("Redis连接未初始化")
}

// RedisGet 获取Redis键值
func (s *DBSession) RedisGet(key string, result interface{}) error {
	if s.RedisDB != nil {
		return s.RedisDB.Get(key).Scan(result)
	}
	return fmt.Errorf("Redis连接未初始化")
}

// MongoDBFind 查询MongoDB文档
func (s *DBSession) MongoDBFind(collection string, query interface{}, result interface{}) error {
	if s.MongoDB != nil {
		c := s.MongoDB.DB("").C(collection)
		return c.Find(query).One(result)
	}
	return fmt.Errorf("MongoDB连接未初始化")
}

// MongoDBInsert 插入MongoDB文档
func (s *DBSession) MongoDBInsert(collection string, document interface{}) error {
	if s.MongoDB != nil {
		c := s.MongoDB.DB("").C(collection)
		return c.Insert(document)
	}
	return fmt.Errorf("MongoDB连接未初始化")
}

// Close 关闭数据库连接
func (s *DBSession) Close() error {
	if s.DB != nil {
		s.DB.Close()
	}
	if s.RedisDB != nil {
		s.RedisDB.Close()
	}
	if s.MongoDB != nil {
		s.MongoDB.Close()
	}
	return nil
}

func (d *DBClient) Close() error {
	if d.session.DB != nil {
		d.session.DB.Close()
	}
	if d.session.RedisDB != nil {
		d.session.RedisDB.Close()
	}
	if d.session.MongoDB != nil {
		d.session.MongoDB.Close()
	}
	return nil
}
