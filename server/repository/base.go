package repository

import (
	"context"

	"next-dbm/server/common/nd"
	"next-dbm/server/env"

	"gorm.io/gorm"
)

type baseRepository struct {
}

func (b *baseRepository) GetDB(c context.Context) *gorm.DB {
	db, ok := c.Value(nd.DB).(*gorm.DB)
	if !ok {
		return env.GetDB()
	}
	return db
}
