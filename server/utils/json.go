package utils

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

type MenuItem struct {
	Title string `json:"title"`
	Key   string `json:"key"`
	// Icon     string      `json:"icon"`
	MenuType string      `json:"menuType"`
	Children []MenuItem  `json:"children"`
	IsLeaf   bool        `json:"isLeaf"`
	Attr     interface{} `json:"attr"`
}

func convertSliceToMap(slice []string) map[string]string {
	result := make(map[string]string)
	for i, v := range slice {
		result[strconv.Itoa(i)] = v
	}
	return result
}

// RowsToKeyValueJson 将 *sql.Rows 转换为 map[string]string 格式
func RowsToKeyValueJson(rows *sql.Rows) (map[string]string, error) {
	// 初始化结果 map
	result := make(map[string]string)

	// 遍历结果集
	for rows.Next() {
		// 假设只返回两个列：Variable_name 和 Value
		var key, value string

		// 将当前行的列值填充到 key 和 value 中
		if err := rows.Scan(&key, &value); err != nil {
			return nil, err
		}

		// 将 key-value 对存储到结果 map 中
		result[key] = value
	}

	// 检查 rows 是否有任何错误
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

// RowsToKeyValueJson 将 *sql.Rows 转换为 key-value 形式的 JSON 对象
/*

[{Value: "ON", Variable_name: "auto_generate_certs"},
{Value: "1", Variable_name: "auto_increment_increment"}]
*/
// func RowsToKeyValueJson(rows *sql.Rows) ([]map[string]interface{}, error) {
// 	// 获取列名
// 	columns, err := rows.Columns()
// 	if err != nil {
// 		return nil, err
// 	}

// 	// 初始化结果切片
// 	var results []map[string]interface{}

// 	// 遍历结果集
// 	for rows.Next() {
// 		// 创建一个存储列值的 slice，长度为列数
// 		values := make([]interface{}, len(columns))
// 		// 创建一个指针数组，存储指向列值的指针
// 		valuePtrs := make([]interface{}, len(columns))

// 		for i := range columns {
// 			valuePtrs[i] = &values[i]
// 		}

// 		// 将当前行的列值填充到 values 中
// 		if err := rows.Scan(valuePtrs...); err != nil {
// 			return nil, err
// 		}

// 		// 创建一个 map 存储 key-value 对
// 		rowMap := make(map[string]interface{})
// 		for i, col := range columns {
// 			var v interface{}
// 			val := values[i]

// 			// 处理数据库中的 NULL 值
// 			if b, ok := val.([]byte); ok {
// 				v = string(b)
// 			} else {
// 				v = val
// 			}

// 			rowMap[col] = v
// 		}

// 		// 将当前行的 map 添加到结果集中
// 		results = append(results, rowMap)
// 	}

// 	// 检查 rows 是否有任何错误
// 	if err := rows.Err(); err != nil {
// 		return nil, err
// 	}

// 	return results, nil
// }

/*
表数据转换JSON
[{"0":"Database"},{"0":"information_schema"}]
*/
// func RowsToJSONArray(rows *sql.Rows) (interface{}, error) {
// 	// 获取列名
// 	columns, err := rows.Columns()
// 	if err != nil {
// 		return "", fmt.Errorf("获取列名失败: %v", err)
// 	}

// 	// 存储所有行的结果
// 	var allDataArray []map[string]string
// 	convertedMap := convertSliceToMap(columns)
// 	allDataArray = append(allDataArray, convertedMap)
// 	var count = 0
// 	// 遍历结果集的每一行
// 	for rows.Next() {
// 		count++
// 		// 创建一个存储每行数据的切片
// 		values := make([]interface{}, len(columns))
// 		valuePtrs := make([]interface{}, len(columns))

// 		for i := range values {
// 			valuePtrs[i] = &values[i]
// 		}

// 		// 扫描行数据
// 		if err := rows.Scan(valuePtrs...); err != nil {
// 			return "", fmt.Errorf("Scan失败: %v", err)
// 		}

// 		// 将 []interface{} 转换为 []string
// 		row := make([]string, len(columns))
// 		for i, val := range values {
// 			if b, ok := val.([]byte); ok {
// 				row[i] = string(b)
// 			} else if s, ok := val.(string); ok {
// 				row[i] = s
// 			}
// 		}

// 		// 将 row 转换为 map 并追加到 allDataArray
// 		convertedMap := convertSliceToMap(row)
// 		allDataArray = append(allDataArray, convertedMap)
// 	}
// 	// fmt.Println("row count ",count)
// 	// 将所有数据转换为 JSON 格式
// 	// jsonData, err := json.Marshal(allDataArray)
// 	// if err != nil {
// 	//     return "", fmt.Errorf("JSON 序列化失败: %v", err)
// 	// }

// 	// 返回 JSON 字符串
// 	return allDataArray, nil
// }

// 新版本
func RowsToJSONArray(rows *sql.Rows) ([]map[string]interface{}, error) {
	defer rows.Close()

	// 获取列名
	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("获取列名失败: %v", err)
	}

	var result []map[string]interface{}
	// ===== 表头（第 0 行）=====
	headerRow := make(map[string]interface{})
	for _, col := range columns {
		headerRow[col] = col
	}
	result = append(result, headerRow)
	for rows.Next() {
		// 创建一个存储每行数据的切片
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		// 扫描行数据
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("Scan失败: %v", err)
		}

		// 将行数据映射到 map
		rowMap := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]

			// 处理 []byte 类型 -> string
			if b, ok := val.([]byte); ok {
				rowMap[col] = string(b)
			} else {
				rowMap[col] = val
			}
		}

		result = append(result, rowMap)
	}

	// 检查 rows 是否有错误
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows 迭代出错: %v", err)
	}

	return result, nil
}

//	表结果转成treeJSON
//
// rowsToMenuJson 处理传入的 rows 对象并返回 JSON 结构
func RowsToMenuJson(rows *sql.Rows, parentKey string, menuType string, attr interface{}) ([]MenuItem, error) {
	// 存储结果的切片
	var result []MenuItem
	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("获取列名失败: %w", err)
	}

	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))
	// 遍历结果集
	counter := 0
	for rows.Next() {
		for i := range columns {
			valuePtrs[i] = &values[i]
		}
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("Scan失败: %w", err)
		}

		// if err := rows.Scan(&dbname); err != nil {
		// 	return nil, fmt.Errorf("Scan失败: %w", err)
		// }
		rowMap := make(map[string]string)
		for i, col := range columns {
			var v interface{}
			val := values[i]

			b, ok := val.([]byte)
			if ok {
				v = string(b)
			} else {
				v = val
			}
			// 将结果存储在 map 中
			rowMap[col] = fmt.Sprintf("%v", v)
			fmt.Printf("Column: %s, Value: %v\n", col, v)
		}
		// fmt.Printf("@@@@ok: %s %s\n", rowMap, attr)
		// 类型断言：确保 attr 是 map[string]interface{}
		if m, ok := attr.(map[string]interface{}); ok {
			fmt.Printf("Type assertion ok: %t\n", ok) // 使用 %t 打印布尔值
			// 检查键是否存在并断言值为 string
			if assetID, exists := m["assetId"].(string); exists {
				rowMap["assetId"] = assetID
				fmt.Printf("assetId: %s\n", assetID)
			} else {
				fmt.Println("assetId not a string or missing")
			}
		} else {
			fmt.Println("Type assertion failed: attr is not a map[string]interface{}")
		}

		dbname := rowMap[columns[0]]
		// 初始化空的 children 切片
		children := []MenuItem{}
		// 构建 MenuItem 对象
		item := MenuItem{
			Title: dbname,
			Key:   fmt.Sprintf("%s-%d", parentKey, counter), // 动态生成 key
			// Icon:     icon,                 // 固定的 icon 字符串
			MenuType: menuType, // 固定的 menuType 字符串
			Children: children, // 空的 children 数组
			IsLeaf:   false,
			Attr:     rowMap,
		}

		// 根据 menuType 动态添加子节点
		switch menuType {
		case "databaseMenu":
			item.Children = append(item.Children,
				MenuItem{Title: "tables", Key: fmt.Sprintf("%s-%d-0", parentKey, counter), MenuType: "tablesMenu", Children: children, Attr: attr},
				MenuItem{Title: "views", Key: fmt.Sprintf("%s-%d-1", parentKey, counter), MenuType: "viewsMenu", Children: children, Attr: attr},
				MenuItem{Title: "functions", Key: fmt.Sprintf("%s-%d-2", parentKey, counter), MenuType: "functionsMenu", Children: children, Attr: attr},
				MenuItem{Title: "procedures", Key: fmt.Sprintf("%s-%d-3", parentKey, counter), MenuType: "proceduresMenu", Children: children, Attr: attr},
				MenuItem{Title: "sqls", Key: fmt.Sprintf("%s-%d-4", parentKey, counter), MenuType: "sqlsMenu", Children: children, Attr: attr},
			)
		case "tablesMenu":
			item.MenuType = "tableMenu"
			item.Children = append(item.Children,
				MenuItem{Title: "columns", Key: fmt.Sprintf("%s-%d-0", parentKey, counter), MenuType: "columnsMenu", Children: children, Attr: attr},
				MenuItem{Title: "keys", Key: fmt.Sprintf("%s-%d-1", parentKey, counter), MenuType: "keysMenu", Children: children, Attr: attr},
				MenuItem{Title: "indexs", Key: fmt.Sprintf("%s-%d-2", parentKey, counter), MenuType: "indexsMenu", Children: children, Attr: attr},
			)
		case "viewsMenu":
			item.MenuType = "viewMenu"
			item.IsLeaf = true
		case "functionsMenu":
			item.MenuType = "functionMenu"
			item.Title = rowMap[columns[1]]
			item.IsLeaf = true
		case "proceduresMenu":
			item.MenuType = "procedureMenu"
			item.Title = rowMap[columns[1]]
			item.IsLeaf = true
		case "sqlsMenu":
			item.MenuType = "sqlMenu"
			item.IsLeaf = true

		case "columnsMenu":
			item.MenuType = "columnMenu"
			item.IsLeaf = true
		case "keysMenu":
			item.MenuType = "keyMenu"
			item.IsLeaf = true
		case "indexsMenu":
			item.MenuType = "indexMenu"
			item.IsLeaf = true
		}
		// 将 MenuItem 添加到结果切片中
		result = append(result, item)
		counter++

	}

	return result, nil
}

func RowsToInsertStatements(rows *sql.Rows, tableName string) (string, error) {
	// 获取列名
	columns, err := rows.Columns()
	if err != nil {
		return "", fmt.Errorf("获取列名失败: %v", err)
	}

	var insertStatements []string
	var count = 0

	// 遍历结果集的每一行
	for rows.Next() {
		count++
		// 创建一个存储每行数据的切片
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))

		for i := range values {
			valuePtrs[i] = &values[i]
		}

		// 扫描行数据
		if err := rows.Scan(valuePtrs...); err != nil {
			return "", fmt.Errorf("Scan失败: %v", err)
		}

		// 构建每行的值
		var rowValues []string
		for _, val := range values {
			if b, ok := val.([]byte); ok {
				rowValues = append(rowValues, fmt.Sprintf("'%s'", string(b)))
			} else if s, ok := val.(string); ok {
				rowValues = append(rowValues, fmt.Sprintf("'%s'", s))
			} else if val == nil {
				rowValues = append(rowValues, "NULL")
			} else {
				rowValues = append(rowValues, fmt.Sprintf("'%v'", val))
			}
		}

		// 拼接成完整的 INSERT 语句
		insertStatement := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s);",
			tableName,
			strings.Join(columns, ", "),
			strings.Join(rowValues, ", "))

		// 保存语句
		insertStatements = append(insertStatements, insertStatement)
	}

	// 将所有的 INSERT 语句合并为一个大字符串
	finalInsertStatements := strings.Join(insertStatements, "\n")

	return finalInsertStatements, nil
}

func RowsToTablesArray(rows *sql.Rows) ([]string, error) {
	// 存储所有行的结果
	var tableNames []string
	// 遍历结果集的每一行
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, fmt.Errorf("读取表名失败: %v", err)
		}
		tableNames = append(tableNames, tableName)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("遍历rows时出错: %v", err)
	}

	return tableNames, nil
}
