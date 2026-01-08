package repository

import (
	"context"
	"next-dbm/server/model"
)

var TranslationsRepository = new(translationsRepository)

type translationsRepository struct {
	baseRepository
}

func (r translationsRepository) FindAll(c context.Context) (o []model.Translations, err error) {
	err = r.GetDB(c).Find(&o).Error
	return
}

func (r translationsRepository) FindByLangCode(c context.Context, langCode string) (o []model.Translations, err error) {
	t := model.Translations{}
	db := r.GetDB(c).Table(t.TableName())

	if len(langCode) > 0 {
		db = db.Where("lang_code = ?", langCode)
	}

	err = db.Find(&o).Error
	if o == nil {
		o = make([]model.Translations, 0)
	}
	return
}
func (r translationsRepository) Create(c context.Context, o *model.Translations) error {
	return r.GetDB(c).Create(o).Error
}

func (r translationsRepository) UpdateById(c context.Context, o *model.Translations, id string) error {
	o.ID = id
	return r.GetDB(c).Updates(o).Error
}

func (r translationsRepository) DeleteById(c context.Context, id string) error {
	return r.GetDB(c).Where("id = ?", id).Delete(model.Translations{}).Error
}

func (r translationsRepository) FindById(c context.Context, id string) (o *model.Translations, err error) {
	err = r.GetDB(c).Where("id = ?", id).First(&o).Error
	return
}

func (r translationsRepository) FindByKey(c context.Context, translationKey string) (o *model.Translations, err error) {
	err = r.GetDB(c).Where("translation_key = ?", translationKey).First(&o).Error
	return
}

func (r translationsRepository) FindByLangCodeKey(c context.Context, langCode, translationKey string) (o *model.Translations, err error) {
	err = r.GetDB(c).Where("lang_code =? and translation_key = ?", langCode, translationKey).First(&o).Error
	return
}
