package mysql

import (
	"next-dbm/server/log"

	"github.com/go-mysql-org/go-mysql/mysql"
	"go.uber.org/zap"
)

// SimpleHandler 简化实现
type SimpleHandler struct {
	dbName string // 用于存储数据库名称
}

func (h *SimpleHandler) GetDBName() string {
	return h.dbName
}

// UseDB 切换数据库（空实现）
func (h *SimpleHandler) UseDB(dbName string) error {
	h.dbName = dbName // 捕获数据库名称
	log.Info("Client requested to use database: ", zap.Any("dbName", dbName))
	log.Info("切换数据库到: ", zap.Any("dbName", dbName))
	return nil
}

// HandleQuery 处理简单查询
func (h *SimpleHandler) HandleQuery(query string) (*mysql.Result, error) {
	log.Info("收到查询:", zap.Any("query", query))
	// 简单返回一个固定结果
	// result := mysql.NewResult(0, 0, 0, 0, []*mysql.Field{
	// 	{Name: "result", Type: mysql.MYSQL_TYPE_LONG},
	// })
	// result.Values = [][]interface{}{{42}}
	return nil, nil
}

// HandleFieldList 返回空字段列表
func (h *SimpleHandler) HandleFieldList(table string, fieldWildcard string) ([]*mysql.Field, error) {
	return nil, nil
}

// HandleStmtPrepare 预编译（空实现）
func (h *SimpleHandler) HandleStmtPrepare(query string) (params int, columns int, context interface{}, err error) {
	return 0, 0, nil, nil
}

// HandleStmtExecute 执行预编译语句（空实现）
func (h *SimpleHandler) HandleStmtExecute(context interface{}, query string, args []interface{}) (*mysql.Result, error) {
	return nil, nil
}

// HandleStmtClose 关闭预编译语句（空实现）
func (h *SimpleHandler) HandleStmtClose(context interface{}) error {
	return nil
}

// HandleOtherCommand 处理未知命令（返回错误）
func (h *SimpleHandler) HandleOtherCommand(cmd byte, data []byte) error {
	return mysql.NewError(mysql.ER_UNKNOWN_ERROR, "未知命令")
}
