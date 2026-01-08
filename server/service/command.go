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

var CommandService = new(commandService)

type commandService struct {
	baseService
}

func (s commandService) Create(ctx context.Context, m maps.Map) (*model.Command, error) {

	data, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}
	var item model.Command
	if err := json.Unmarshal(data, &item); err != nil {
		return nil, err
	}

	item.ID = utils.UUID()
	item.Created = common.NowJsonTime()

	return &item, s.Transaction(ctx, func(ctx context.Context) error {
		if err := repository.CommandRepository.Create(ctx, &item); err != nil {
			return err
		}
		return nil
	})
}
