package api

import (
	"context"
	"next-dbm/server/common/maps"
	"next-dbm/server/model"
	"strconv"
	"strings"

	"next-dbm/server/dto"
	"next-dbm/server/repository"
	"next-dbm/server/service"

	"github.com/labstack/echo/v4"
)

type UserGroupApi struct{}

func (userGroupApi UserGroupApi) UserGroupCreateEndpoint(c echo.Context) error {
	var item model.UserGroup
	if err := c.Bind(&item); err != nil {
		return err
	}

	if _, err := service.UserGroupService.Create(context.TODO(), item.Name, item.Members); err != nil {
		return err
	}

	return Success(c, item)
}

// 递归查询子节点并绑定到父节点
func attachSubItems(parent *model.UserGroupForPage) error {
	// 1. 查询直接子节点
	subItems, err := repository.UserGroupRepository.FindByParentId(context.TODO(), parent.ID)
	if err != nil {
		return err
	}

	// 2. 递归处理每个子节点
	for i := range subItems {
		child := &subItems[i]
		if err := attachSubItems(child); err != nil { // 递归调用
			return err
		}
	}

	// 3. 将子节点附加到父节点
	parent.SubItems = subItems
	return nil
}

// 递归查询子节点并绑定到父节点
func attachSubItemsUserGroup(parent *model.UserGroup) error {
	// 1. 查询直接子节点
	subItems, err := repository.UserGroupRepository.FindUserGroupByParentId(context.TODO(), parent.ID)
	if err != nil {
		return err
	}

	// 2. 递归处理每个子节点
	for i := range subItems {
		child := &subItems[i]
		if err := attachSubItemsUserGroup(child); err != nil { // 递归调用
			return err
		}
	}

	// 3. 将子节点附加到父节点
	parent.SubItems = subItems
	return nil
}
func (userGroupApi UserGroupApi) UserGroupPagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	name := c.QueryParam("name")
	parentId := c.QueryParam("parentId")
	order := c.QueryParam("order")
	field := c.QueryParam("field")

	items, total, err := repository.UserGroupRepository.Find(context.TODO(), pageIndex, pageSize, name, parentId, order, field)
	if err != nil {
		return err
	}
	for i := range items {
		if err := attachSubItems(&items[i]); err != nil { // 从每个父节点开始递归
			return err
		}
	}
	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (userGroupApi UserGroupApi) UserGroupUpdateEndpoint(c echo.Context) error {
	id := c.Param("id")

	var item model.UserGroup
	if err := c.Bind(&item); err != nil {
		return err
	}

	if err := service.UserGroupService.Update(id, item.Name, item.Members); err != nil {
		return err
	}

	return Success(c, nil)
}

func (userGroupApi UserGroupApi) UserGroupDeleteEndpoint(c echo.Context) error {
	ids := c.Param("id")
	split := strings.Split(ids, ",")
	for i := range split {
		userId := split[i]
		if err := service.UserGroupService.DeleteById(userId); err != nil {
			return err
		}
	}

	return Success(c, nil)
}

func (userGroupApi UserGroupApi) UserGroupGetEndpoint(c echo.Context) error {
	id := c.Param("id")

	item, err := repository.UserGroupRepository.FindById(context.TODO(), id)
	if err != nil {
		return err
	}

	members, err := repository.UserGroupMemberRepository.FindByUserGroupId(context.TODO(), id)
	if err != nil {
		return err
	}

	userGroup := dto.UserGroup{
		Id:      item.ID,
		Name:    item.Name,
		Created: item.Created,
		Members: members,
	}

	return Success(c, userGroup)
}

func (userGroupApi UserGroupApi) UserGroupAllEndpoint(c echo.Context) error {
	// userGroups, err := repository.UserGroupRepository.FindAll(context.Background())
	// if err != nil {
	// 	return err
	// }
	userGroups, err := repository.UserGroupRepository.FindUserGroupByParentId(context.Background(), "0")
	if err != nil {
		return err
	}
	for i := range userGroups {
		if err := attachSubItemsUserGroup(&userGroups[i]); err != nil { // 从每个父节点开始递归
			return err
		}
	}
	return Success(c, userGroups)
}

func (userGroupApi UserGroupApi) UpdateStatusEndpoint(c echo.Context) error {
	id := c.Param("id")
	status := c.QueryParam("status")
	account, _ := GetCurrentAccount(c)
	if account.ID == id {
		return Fail(c, -1, "不能操作自身账户")
	}

	u := model.UserGroup{
		ID:     id,
		Status: status,
	}

	if err := repository.UserGroupRepository.Update(context.TODO(), &u); err != nil {
		return err
	}

	return Success(c, nil)
}
