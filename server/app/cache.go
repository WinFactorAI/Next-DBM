package app

import (
	"next-dbm/server/global/cache"
	"next-dbm/server/service"
)

func setupCache() {
	cache.TokenManager.OnEvicted(service.UserService.OnEvicted)
}
