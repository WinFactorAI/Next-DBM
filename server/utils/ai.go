package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type DeepSeekRequest struct {
	Prompt    string `json:"prompt"`
	MaxTokens int    `json:"max_tokens"`
	Model     string `json:"model"`
}
type DeepSeekResponse struct {
	Choices []struct {
		Text string `json:"text"`
	} `json:"choices"`
}

func CallDeepSeekAPI(prompt string, maxTokens int, apiKey string, model string) (string, error) {
	url := "https://api.deepseek.com/beta/completions"
	requestBody := DeepSeekRequest{
		Prompt:    prompt,
		MaxTokens: maxTokens,
		Model:     model,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	// 打印响应体以调试
	fmt.Println("Response Body:", string(body))

	// 检查状态码
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API request failed with status code: %d, body: %s", resp.StatusCode, string(body))
	}

	var deepSeekResponse DeepSeekResponse
	err = json.Unmarshal(body, &deepSeekResponse)
	if err != nil {
		return "", err
	}

	if len(deepSeekResponse.Choices) > 0 {
		return deepSeekResponse.Choices[0].Text, nil
	}

	return "", fmt.Errorf("no response from DeepSeek API")
}
