package lib

import (
	"fmt"
	"sync"

	"next-dbm/server/log"

	"go.uber.org/zap"
)

type CredentialProvider struct {
}

func (cp *CredentialProvider) CheckUsername(username string) (bool, error) {
	return false, nil
}
func (cp *CredentialProvider) GetCredentials(username string) (password string, found bool, err error) {
	return "root", true, nil
}

// implements a in memory credential provider
type InMemoryProvider struct {
	userPool sync.Map // username -> password
}

func (m *InMemoryProvider) CheckUsername(username string) (found bool, err error) {
	_, ok := m.userPool.Load(username)
	if !ok {
		return false, fmt.Errorf("用户 %s 没有权限。", username)
	}
	return true, nil
}

func (m *InMemoryProvider) GetCredential(username string) (password string, found bool, err error) {
	v, ok := m.userPool.Load(username)
	if !ok {
		return "", false, nil
	}
	return v.(string), true, nil
}

func (m *InMemoryProvider) AddUser(username, password string) {
	m.userPool.Store(username, password)
}
func (m *InMemoryProvider) RemoveUser(username string) {
	m.userPool.Delete(username)
}

func (m *InMemoryProvider) RemoveAllUser() {
	m.userPool.Range(func(key, _ interface{}) bool {
		m.userPool.Delete(key)
		return true
	})
}
func (m *InMemoryProvider) GetAllUser() []string {
	var users []string
	m.userPool.Range(func(key, _ interface{}) bool {
		log.Info("GetAllUser ", zap.Any("key", key.(string)))
		users = append(users, key.(string))
		return true
	})
	return users
}
