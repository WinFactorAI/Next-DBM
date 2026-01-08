package service

import (
	"context"
	"encoding/json"
	"next-dbm/server/common/maps"

	"next-dbm/server/common"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"
)

var SqlLogService = new(sqlLogService)

type sqlLogService struct {
	baseService
}

func (s sqlLogService) Create(m maps.Map) (*model.SqlLog, error) {

	data, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}
	var item model.SqlLog
	if err := json.Unmarshal(data, &item); err != nil {
		return nil, err
	}

	item.ID = utils.UUID()
	item.Created = common.NowJsonTime()

	return &item, s.Transaction(context.TODO(), func(ctx context.Context) error {
		if err := repository.SqlLogRepository.Create(ctx, &item); err != nil {
			return err
		}
		return nil
	})
}
