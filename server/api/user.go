package api

import (
	"context"
	"next-dbm/server/common/maps"
	"next-dbm/server/proxy"
	"next-dbm/server/utils"
	"strconv"
	"strings"

	"next-dbm/server/model"
	"next-dbm/server/repository"
	"next-dbm/server/service"

	"github.com/labstack/echo/v4"
)

type UserApi struct{}

func (userApi UserApi) CreateEndpoint(c echo.Context) (err error) {
	var item model.User
	if err := c.Bind(&item); err != nil {
		return err
	}

	if len(item.Password) > 100 {
		return Fail(c, -1, "您输入的密码过长")
	}

	if err := service.UserService.CreateUser(item); err != nil {
		return err
	}

	return Success(c, item)
}

func (userApi UserApi) PagingEndpoint(c echo.Context) error {
	pageIndex, _ := strconv.Atoi(c.QueryParam("pageIndex"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	userGroupId := c.QueryParam("userGroupId")
	username := c.QueryParam("username")
	nickname := c.QueryParam("nickname")
	mail := c.QueryParam("mail")

	order := c.QueryParam("order")
	field := c.QueryParam("field")
	online := c.QueryParam("online")

	items, total, err := repository.UserRepository.Find(context.TODO(), pageIndex, pageSize, userGroupId, username, nickname, mail, online, "", order, field)
	if err != nil {
		return err
	}

	return Success(c, maps.Map{
		"total": total,
		"items": items,
	})
}

func (userApi UserApi) UpdateEndpoint(c echo.Context) error {
	id := c.Param("id")

	//account, _ := GetCurrentAccount(c)
	//if account.ID == id {
	//	return Fail(c, -1, "cannot modify itself")
	//}

	var item model.User
	if err := c.Bind(&item); err != nil {
		return err
	}

	if err := service.UserService.UpdateUser(id, item); err != nil {
		return err
	}

	repository.UserGroupMemberRepository.DeleteByUserId(context.TODO(), id)

	userGroupMember := model.UserGroupMember{
		ID:          utils.UUID(),
		UserId:      id,
		UserGroupId: item.UserGroupId,
	}
	repository.UserGroupMemberRepository.Create(context.TODO(), &userGroupMember)
	return Success(c, nil)
}

func (userApi UserApi) UpdateStatusEndpoint(c echo.Context) error {
	id := c.Param("id")
	status := c.QueryParam("status")
	account, _ := GetCurrentAccount(c)
	if account.ID == id {
		return Fail(c, -1, "不能操作自身账户")
	}

	if err := service.UserService.UpdateStatusById(id, status); err != nil {
		return err
	}

	go proxy.Reload()
	return Success(c, nil)
}

func (userApi UserApi) DeleteEndpoint(c echo.Context) error {
	ids := c.Param("id")
	account, found := GetCurrentAccount(c)
	if !found {
		return Fail(c, -1, "获取当前登录账户失败")
	}
	split := strings.Split(ids, ",")
	for i := range split {
		userId := split[i]
		if account.ID == userId {
			return Fail(c, -1, "不允许删除自身账户")
		}
		if err := service.UserService.DeleteUserById(userId); err != nil {
			return err
		}
	}

	return Success(c, nil)
}

func (userApi UserApi) GetEndpoint(c echo.Context) error {
	id := c.Param("id")

	item, err := service.UserService.FindById(id)
	if err != nil {
		return err
	}
	userGroupMember, err := repository.UserGroupMemberRepository.FindUserGroupIdsByUserId(context.TODO(), id)
	if err != nil {
		return err
	}

	if len(userGroupMember) > 0 {
		item.UserGroupId = userGroupMember[0]
	}

	return Success(c, item)
}

func (userApi UserApi) ChangePasswordEndpoint(c echo.Context) error {
	id := c.Param("id")
	password := c.FormValue("password")
	if password == "" {
		return Fail(c, -1, "请输入密码")
	}
	ids := strings.Split(id, ",")
	if err := service.UserService.ChangePassword(ids, password); err != nil {
		return err
	}

	return Success(c, "")
}

func (userApi UserApi) ChangeProxyAuthEndpoint(c echo.Context) error {
	id := c.Param("id")
	proxyAuth := c.FormValue("proxyAuth")
	if proxyAuth == "" {
		return Fail(c, -1, "请输入密码")
	}
	ids := strings.Split(id, ",")
	if err := service.UserService.ChangeProxyAuth(ids, proxyAuth); err != nil {
		return err
	}
	//更新代理配置账号密码信息
	go proxy.Reload()
	return Success(c, "")
}

func (userApi UserApi) ResetTotpEndpoint(c echo.Context) error {
	id := c.Param("id")
	ids := strings.Split(id, ",")
	if err := service.UserService.ResetTotp(ids); err != nil {
		return err
	}

	return Success(c, "")
}

func (userApi UserApi) AllEndpoint(c echo.Context) error {
	users, err := repository.UserRepository.FindAll(context.Background())
	if err != nil {
		return err
	}
	items := make([]maps.Map, len(users))
	for i, user := range users {
		items[i] = maps.Map{
			"id":       user.ID,
			"nickname": user.Nickname,
		}
	}
	return Success(c, items)
}
