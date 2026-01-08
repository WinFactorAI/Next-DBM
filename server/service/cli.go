package service

import (
	"context"
	"crypto/md5"
	"fmt"
	"next-dbm/server/common/nd"

	"next-dbm/server/env"
	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/utils"

	"gorm.io/gorm"
)

type Cli struct {
}

func NewCli() *Cli {
	return &Cli{}
}

func (cli Cli) ResetPassword(username string) error {
	user, err := repository.UserRepository.FindByUsername(context.TODO(), username)
	if err != nil {
		return err
	}
	password := "next-dbm"
	passwd, err := utils.Encoder.Encode([]byte(password))
	if err != nil {
		return err
	}
	u := &model.User{
		Password: string(passwd),
		ID:       user.ID,
	}
	if err := repository.UserRepository.Update(context.TODO(), u); err != nil {
		return err
	}
	return nil
}

func (cli Cli) ResetTotp(username string) error {
	user, err := repository.UserRepository.FindByUsername(context.TODO(), username)
	if err != nil {
		return err
	}
	u := &model.User{
		TOTPSecret: "-",
		ID:         user.ID,
	}
	if err := repository.UserRepository.Update(context.TODO(), u); err != nil {
		return err
	}
	return nil
}

func (cli Cli) ChangeEncryptionKey(oldEncryptionKey, newEncryptionKey string) error {

	oldPassword := []byte(fmt.Sprintf("%x", md5.Sum([]byte(oldEncryptionKey))))
	newPassword := []byte(fmt.Sprintf("%x", md5.Sum([]byte(newEncryptionKey))))

	return env.GetDB().Transaction(func(tx *gorm.DB) error {
		c := context.WithValue(context.TODO(), nd.DB, tx)
		credentials, err := repository.CredentialRepository.FindAll(c)
		if err != nil {
			return err
		}
		for i := range credentials {
			credential := credentials[i]
			if err := CredentialService.Decrypt(&credential, oldPassword); err != nil {
				return err
			}
			if err := CredentialService.Encrypt(&credential, newPassword); err != nil {
				return err
			}
			if err := repository.CredentialRepository.UpdateById(c, &credential, credential.ID); err != nil {
				return err
			}
		}
		assets, err := repository.AssetRepository.FindAll(c)
		if err != nil {
			return err
		}
		for i := range assets {
			asset := assets[i]
			if err := AssetService.Decrypt(&asset, oldPassword); err != nil {
				return err
			}
			if err := AssetService.Encrypt(&asset, newPassword); err != nil {
				return err
			}
			if err := repository.AssetRepository.UpdateById(c, &asset, asset.ID); err != nil {
				return err
			}
		}
		return nil
	})
}
