package service

import (
	"context"
	"next-dbm/server/common/nd"
	"next-dbm/server/env"

	"gorm.io/gorm"
)

type baseService struct {
}

func (service baseService) Context(db *gorm.DB) context.Context {
	return context.WithValue(context.TODO(), nd.DB, db)
}

func (service baseService) inTransaction(ctx context.Context) bool {
	_, ok := ctx.Value(nd.DB).(*gorm.DB)
	return ok
}

func (service baseService) Transaction(ctx context.Context, f func(ctx context.Context) error) error {
	if !service.inTransaction(ctx) {
		return env.GetDB().Transaction(func(tx *gorm.DB) error {
			ctx := service.Context(tx)
			return f(ctx)
		})
	}
	return f(ctx)
}
