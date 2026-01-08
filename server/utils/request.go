package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// HttpPostJSON 发送 JSON 格式的 POST 请求
func HttpPostJSON(url string, data interface{}, headers map[string]string, client *http.Client) ([]byte, error) {
	// 序列化 JSON 数据
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	// 创建 HTTP 客户端
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}

	// 构造请求
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	// 设置默认 Header
	req.Header.Set("Content-Type", "application/json")

	// 设置自定义 Header
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	// 发送请求
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// 读取响应体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// 可根据状态码判断是否成功
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return body, fmt.Errorf("http error: %s", resp.Status)
	}

	return body, nil
}
