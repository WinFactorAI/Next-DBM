package service

import (
	"context"
	"errors"

	"next-dbm/server/common"
	"next-dbm/server/common/nd"
	"next-dbm/server/dto"
	"next-dbm/server/env"
	"next-dbm/server/global/cache"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"

	"gorm.io/gorm"
)

var AccessTokenService = new(accessTokenService)

type accessTokenService struct {
	baseService
}

func (service accessTokenService) GenAccessToken(userId string) error {
	return env.GetDB().Transaction(func(tx *gorm.DB) error {
		ctx := service.Context(tx)

		if err := service.DelAccessToken(ctx, userId); err != nil {
			return err
		}

		user, err := repository.UserRepository.FindById(ctx, userId)
		if err != nil {
			return err
		}

		token := "forever-" + utils.UUID()
		accessToken := &model.AccessToken{
			ID:      utils.UUID(),
			UserId:  userId,
			Token:   token,
			Created: common.NowJsonTime(),
		}

		authorization := dto.Authorization{
			Token:    token,
			Remember: false,
			Type:     nd.AccessToken,
			User:     &user,
		}

		cache.TokenManager.Set(token, authorization, cache.NoExpiration)

		return repository.AccessTokenRepository.Create(ctx, accessToken)
	})
}

func (service accessTokenService) Reload() error {
	accessTokens, err := repository.AccessTokenRepository.FindAll(context.TODO())
	if err != nil {
		return err
	}
	for _, accessToken := range accessTokens {
		user, err := repository.UserRepository.FindById(context.TODO(), accessToken.UserId)
		if err != nil {
			return err
		}
		authorization := dto.Authorization{
			Token:    accessToken.Token,
			Remember: false,
			Type:     nd.AccessToken,
			User:     &user,
		}

		cache.TokenManager.Set(accessToken.Token, authorization, cache.NoExpiration)
	}
	return nil
}

func (service accessTokenService) DelAccessToken(ctx context.Context, userId string) error {
	oldAccessToken, err := repository.AccessTokenRepository.FindByUserId(ctx, userId)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	if oldAccessToken.Token != "" {
		cache.TokenManager.Delete(oldAccessToken.Token)
	}
	return repository.AccessTokenRepository.DeleteByUserId(ctx, userId)
}
