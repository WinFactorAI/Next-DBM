package api

import (
	"next-dbm/server/branding"
	"next-dbm/server/common/maps"

	"github.com/labstack/echo/v4"
)

func Branding(c echo.Context) error {
	return Success(c, maps.Map{
		"name":      branding.Name,
		"copyright": branding.Copyright,
		"version":   branding.Version,
		"help":      branding.Help,
		"banner":    branding.Banner,
		"upgrade":   branding.Upgrade,
	})
}
func Version(c echo.Context) error {
	return Success(c, maps.Map{
		"version": branding.Version,
	})
}
