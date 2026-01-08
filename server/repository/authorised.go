package repository

import (
	"context"

	"next-dbm/server/dto"
	"next-dbm/server/model"
)

var AuthorisedRepository = new(authorisedRepository)

type authorisedRepository struct {
	baseRepository
}

func (r authorisedRepository) Create(c context.Context, m *model.Authorised) error {
	return r.GetDB(c).Create(m).Error
}

func (r authorisedRepository) CreateInBatches(c context.Context, m []model.Authorised) error {
	return r.GetDB(c).CreateInBatches(m, 100).Error
}

func (r authorisedRepository) DeleteByUserId(c context.Context, userId string) error {
	return r.GetDB(c).Where("user_id = ?", userId).Delete(model.Authorised{}).Error
}

func (r authorisedRepository) DeleteByUserGroupId(c context.Context, userGroupId string) error {
	return r.GetDB(c).Where("user_group_id = ?", userGroupId).Delete(model.Authorised{}).Error
}

func (r authorisedRepository) DeleteByAssetId(c context.Context, assetId string) error {
	return r.GetDB(c).Where("asset_id = ?", assetId).Delete(model.Authorised{}).Error
}

func (r authorisedRepository) FindByUserId(c context.Context, userId string) (items []model.Authorised, err error) {
	err = r.GetDB(c).Where("user_id = ?", userId).Find(&items).Error
	return
}

func (r authorisedRepository) FindById(c context.Context, id string) (item model.Authorised, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&item).Error
	return
}

func (r authorisedRepository) FindByUserGroupId(c context.Context, userGroupId string) (items []model.Authorised, err error) {
	err = r.GetDB(c).Where("user_group_id = ?", userGroupId).Find(&items).Error
	return
}

func (r authorisedRepository) FindByUserGroupIdIn(c context.Context, userGroupIds []string) (items []model.Authorised, err error) {
	err = r.GetDB(c).Where("user_group_id in ?", userGroupIds).Find(&items).Error
	return
}

func (r authorisedRepository) FindAll(c context.Context, userId, userGroupId, assetId string) (items []model.Authorised, err error) {
	db := r.GetDB(c)
	if userId != "" {
		db = db.Where("user_id = ?", userId)
	}
	if userGroupId != "" {
		db = db.Where("user_group_id = ?", userGroupId)
	}
	if assetId != "" {
		db = db.Where("asset_id = ?", assetId)
	}
	err = db.Find(&items).Error
	return
}

func (r authorisedRepository) FindAssetPage(c context.Context, pageIndex, pageSize int, assetName, userId, userGroupId string) (o []dto.AssetPageForAuthorised, total int64, err error) {
	db := r.GetDB(c).Table("assets").
		Select("authorised.id,authorised.webhook_push_status ,authorised.created, assets.id as asset_id, assets.name as asset_name, strategies.id as strategy_id, strategies.name as strategy_name ,sensitive_command_groups.name as sensitive_command_group_name,sensitive_command_groups.id as sensitive_command_group_id ").
		Joins("left join authorised on authorised.asset_id = assets.id").
		Joins("left join strategies on strategies.id = authorised.strategy_id").
		Joins("left join sensitive_command_groups on sensitive_command_groups.id  = authorised.sensitive_command_group_id")
	dbCounter := r.GetDB(c).Table("assets").Joins("left join authorised on assets.id = authorised.asset_id").Group("assets.id")

	if assetName != "" {
		db = db.Where("assets.name like ?", "%"+assetName+"%")
		dbCounter = dbCounter.Where("assets.name like ?", "%"+assetName+"%")
	}

	if userId != "" {
		db = db.Where("authorised.user_id = ?", userId)
		dbCounter = dbCounter.Where("authorised.user_id = ?", userId)
	}

	if userGroupId != "" {
		db = db.Where("authorised.user_group_id = ?", userGroupId)
		dbCounter = dbCounter.Where("authorised.user_group_id = ?", userGroupId)
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("authorised.created desc").Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]dto.AssetPageForAuthorised, 0)
	}
	return
}

func (r authorisedRepository) DeleteById(c context.Context, id string) error {
	return r.GetDB(c).Where("id = ?", id).Delete(model.Authorised{}).Error
}

func (r authorisedRepository) FindUserPage(c context.Context, pageIndex, pageSize int, userName, assetId string) (o []dto.UserPageForAuthorised, total int64, err error) {
	db := r.GetDB(c).Table("users").
		Select("authorised.id,authorised.webhook_push_status , authorised.created, users.id as user_id, users.nickname as user_name, strategies.id as strategy_id, strategies.name as strategy_name ,sensitive_command_groups.name as sensitive_command_group_name,sensitive_command_groups.id as sensitive_command_group_id").
		Joins("left join authorised on authorised.user_id = users.id").
		Joins("left join strategies      on strategies.id      = authorised.strategy_id").
		Joins("left join sensitive_command_groups      on sensitive_command_groups.id      = authorised.sensitive_command_group_id")
	dbCounter := r.GetDB(c).Table("assets").Joins("left join authorised on assets.id = authorised.asset_id").Group("assets.id")

	if userName != "" {
		db = db.Where("users.nickname like ?", "%"+userName+"%")
		dbCounter = dbCounter.Where("users.nickname like ?", "%"+userName+"%")
	}

	if assetId != "" {
		db = db.Where("authorised.asset_id = ?", assetId)
		dbCounter = dbCounter.Where("authorised.asset_id = ?", assetId)
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("authorised.created desc").Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]dto.UserPageForAuthorised, 0)
	}
	return
}

func (r authorisedRepository) FindUserGroupPage(c context.Context, pageIndex, pageSize int, userName, assetId string) (o []dto.UserGroupPageForAuthorised, total int64, err error) {
	db := r.GetDB(c).Table("user_groups").
		Select("authorised.id,authorised.webhook_push_status , authorised.created, user_groups.id as user_group_id, user_groups.name as user_group_name, strategies.id as strategy_id, strategies.name as strategy_name ,sensitive_command_groups.name as sensitive_command_group_name").
		Joins("left join authorised on authorised.user_group_id = user_groups.id").
		Joins("left join strategies on strategies.id = authorised.strategy_id").
		Joins("left join sensitive_command_groups on sensitive_command_groups.id = authorised.sensitive_command_group_id")
	dbCounter := r.GetDB(c).Table("assets").Joins("left join authorised on assets.id = authorised.asset_id").Group("assets.id")

	if userName != "" {
		db = db.Where("user_groups.name like ?", "%"+userName+"%")
		dbCounter = dbCounter.Where("user_groups.name like ?", "%"+userName+"%")
	}

	if assetId != "" {
		db = db.Where("authorised.asset_id = ?", assetId)
		dbCounter = dbCounter.Where("authorised.asset_id = ?", assetId)
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = db.Order("authorised.created desc").Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&o).Error
	if o == nil {
		o = make([]dto.UserGroupPageForAuthorised, 0)
	}
	return
}

func (r authorisedRepository) FindAllUsersAssetsProxyAuth(c context.Context, protocol string) (o []dto.UsersAssetsProxyAuth, err error) {
	// 构建第一个子查询
	sub1 := r.GetDB(c).
		Table("authorised").
		Select("COALESCE(u1.username, '') || '#' || a.name AS username, u1.proxy_auth").
		Joins("INNER JOIN assets a ON authorised.asset_id = a.id ").
		Joins("LEFT JOIN users u1 ON authorised.user_id = u1.id and u1.status='enabled'").
		Where("authorised.user_id  != '' and a.protocol = ?", protocol)

	// 构建第二个子查询
	sub2 := r.GetDB(c).
		Table("authorised").
		Select("COALESCE(u2.username, '') || '#' || a.name AS username, u2.proxy_auth").
		Joins("INNER JOIN assets a ON authorised.asset_id = a.id").
		Joins("LEFT JOIN user_group_members ugm ON authorised.user_group_id = ugm.user_group_id").
		Joins("LEFT JOIN users u2 ON ugm.user_id = u2.id and u2.status='enabled'").
		Where("authorised.user_group_id  != '' and a.protocol = ?", protocol)

	// 合并查询
	err = r.GetDB(c).
		Table("(?) AS auth", r.GetDB(c).Raw("? UNION ALL ?", sub1, sub2)).
		Select("DISTINCT *").
		Where("proxy_auth is not NULL").
		Scan(&o).Error

	if o == nil {
		o = make([]dto.UsersAssetsProxyAuth, 0)
	}
	return
}

func (r authorisedRepository) FindAllByAssetsIdUsersId(c context.Context, assetId string, userId string) (o []dto.AuthorisedAsset, err error) {
	err = r.GetDB(c).Table("authorised").
		Select("authorised.id,authorised.webhook_push_status , authorised.created, authorised.asset_id,authorised.sensitive_command_group_id,authorised.strategy_id,authorised.user_id,authorised.user_group_id").
		Where("authorised.asset_id = ? AND ( EXISTS ( SELECT 1 FROM user_group_members WHERE user_group_members.user_id = ? AND user_group_members.user_group_id = authorised.user_group_id ) OR authorised.user_id = ? )", assetId, userId, userId).
		Find(&o).Error
	if o == nil {
		o = make([]dto.AuthorisedAsset, 0)
	}
	return
}

func (r authorisedRepository) Update(c context.Context, m *model.Authorised) error {
	return r.GetDB(c).Updates(m).Error
}
