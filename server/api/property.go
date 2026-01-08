package api

import (
	"context"

	"next-dbm/server/repository"
	"next-dbm/server/service"

	"github.com/labstack/echo/v4"
)

type PropertyApi struct{}

func (api PropertyApi) PropertyGetEndpoint(c echo.Context) error {
	properties := repository.PropertyRepository.FindAllMap(context.TODO())
	return Success(c, properties)
}

func (api PropertyApi) PropertyUpdateEndpoint(c echo.Context) error {
	var item map[string]interface{}
	if err := c.Bind(&item); err != nil {
		return err
	}

	if err := service.PropertyService.Update(item); err != nil {
		return err
	}
	return Success(c, nil)
}

func (api PropertyApi) PropertyLdapUserSyncEndpoint(c echo.Context) error {

	return Success(c, nil)
}

func (api PropertyApi) PropertyRestartAppEndpoint(c echo.Context) error {
	service.PropertyService.RestartApp()
	return Success(c, nil)
}

func (api PropertyApi) PropertyStatusAppEndpoint(c echo.Context) error {
	service.PropertyService.CheckAppStatus()
	return Success(c, nil)
}

func (api PropertyApi) PropertyStopAppEndpoint(c echo.Context) error {
	service.PropertyService.StopApp()
	return Success(c, nil)
}

func (api PropertyApi) PropertyCheckVersionEndpoint(c echo.Context) error {
	version, err := service.PropertyService.CheckNewVersion()
	if err != nil {
		return err
	}
	return Success(c, version)
}

func (api PropertyApi) PropertyUpgradeAppEndpoint(c echo.Context) error {
	err := service.PropertyService.UpgradeApp()
	if err != nil {
		return err
	}
	return Success(c, nil)
}
func (api PropertyApi) PropertyUpgradeFinishAppEndpoint(c echo.Context) error {
	err := service.PropertyService.UpgradeFinishApp()
	if err != nil {
		return err
	}
	return Success(c, nil)
}

func (api PropertyApi) PropertyMysqlProxyStartEndpoint(c echo.Context) error {

	return Success(c, nil)
}
func (api PropertyApi) PropertyMysqlProxyStopEndpoint(c echo.Context) error {

	return Success(c, nil)
}

func (api PropertyApi) PropertyMysqlProxyStatusEndpoint(c echo.Context) error {

	return Success(c, nil)
}

// PropertyPostgreProxy
func (api PropertyApi) PropertyPostgreProxyStartEndpoint(c echo.Context) error {

	return Success(c, nil)
}
func (api PropertyApi) PropertyPostgreProxyStopEndpoint(c echo.Context) error {

	return Success(c, nil)
}

func (api PropertyApi) PropertyPostgreProxyStatusEndpoint(c echo.Context) error {

	return Success(c, nil)
}

// PropertyOracleProxy
func (api PropertyApi) PropertyOracleProxyStartEndpoint(c echo.Context) error {

	return Success(c, nil)
}
func (api PropertyApi) PropertyOracleProxyStopEndpoint(c echo.Context) error {

	return Success(c, nil)
}

func (api PropertyApi) PropertyOracleProxyStatusEndpoint(c echo.Context) error {

	return Success(c, nil)
}

// MariaDB
func (api PropertyApi) PropertyMariaDBProxyStartEndpoint(c echo.Context) error {
	port := c.Param("port")
	service.PropertyService.MariaDBStart(port)
	return Success(c, nil)
}
func (api PropertyApi) PropertyMariaDBProxyStopEndpoint(c echo.Context) error {
	service.PropertyService.MariaDBStop()
	return Success(c, nil)
}

func (api PropertyApi) PropertyMariaDBProxyStatusEndpoint(c echo.Context) error {
	status, _ := service.PropertyService.GetMariaDBStatus()
	return Success(c, status)
}

// sqlServer
func (api PropertyApi) PropertySqlServerProxyStartEndpoint(c echo.Context) error {
	// port := c.Param("port")
	// service.PropertyService.MariaDBStart(port)
	return Success(c, nil)
}
func (api PropertyApi) PropertySqlServerProxyStopEndpoint(c echo.Context) error {
	service.PropertyService.MariaDBStop()
	return Success(c, nil)
}

func (api PropertyApi) PropertySqlServerProxyStatusEndpoint(c echo.Context) error {
	// status, _ := service.PropertyService.GetMariaDBStatus()
	return Success(c, false)
}

// redis
func (api PropertyApi) PropertyRedisProxyStartEndpoint(c echo.Context) error {
	// port := c.Param("port")
	// service.PropertyService.MariaDBStart(port)
	return Success(c, nil)
}
func (api PropertyApi) PropertyRedisProxyStopEndpoint(c echo.Context) error {
	// service.PropertyService.MariaDBStop()
	return Success(c, nil)
}

func (api PropertyApi) PropertyRedisProxyStatusEndpoint(c echo.Context) error {
	// status, _ := service.PropertyService.GetMariaDBStatus()
	return Success(c, false)
}
