package app

import (
	"io/fs"
	"net/http"
	"os"

	"next-dbm/server/api"
	"next-dbm/server/api/worker"
	mw "next-dbm/server/app/middleware"
	"next-dbm/server/config"
	"next-dbm/server/log"
	"next-dbm/server/resource"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func getFS(useOS bool) fs.FS {
	if useOS {
		log.Debug("using live mode")
		return os.DirFS("web/dist")
	}

	log.Debug("using embed mode")
	fsys, err := fs.Sub(resource.Resource, "build")
	if err != nil {
		panic(err)
	}

	return fsys
}

func WrapHandler(h http.Handler) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set("Cache-Control", `public, max-age=31536000`)
		h.ServeHTTP(c.Response(), c.Request())
		return nil
	}
}

func setupRoutes() *echo.Echo {

	e := echo.New()
	e.HideBanner = true
	//e.Logger = log.GetEchoLogger()
	//e.Use(log.Hook())

	fsys := getFS(config.GlobalCfg.Debug)
	fileServer := http.FileServer(http.FS(fsys))
	handler := WrapHandler(fileServer)
	e.GET("/", handler)
	e.GET("/branding", api.Branding)
	e.GET("/version", api.Version)
	e.GET("/favicon.ico", handler)
	e.GET("/static/*", handler)

	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		Skipper:      middleware.DefaultSkipper,
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))
	e.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
		DisableStackAll:   true, // 禁用 panic 堆栈输出
		DisablePrintStack: true, // 禁用打印（Echo v4.11 以后）
	}))
	e.Use(mw.ErrorHandler)
	e.Use(mw.TcpWall)
	e.Use(mw.Auth)
	//e.Use(RBAC)
	e.Use(middleware.Gzip())

	accountApi := new(api.AccountApi)
	guacamoleApi := new(api.GuacamoleApi)
	webTerminalApi := new(api.WebTerminalApi)
	UserApi := new(api.UserApi)
	UserGroupApi := new(api.UserGroupApi)
	DBMAssetApi := new(api.DBMAssetApi)

	SqlsApi := new(api.SqlsApi)

	AssetApi := new(api.AssetApi)
	CommandApi := new(api.CommandApi)

	CredentialApi := new(api.CredentialApi)
	SessionApi := new(api.SessionApi)
	LoginLogApi := new(api.LoginLogApi)
	SqlLogApi := new(api.SqlLogApi)
	OperLogApi := new(api.OperLogApi)

	PropertyApi := new(api.PropertyApi)
	OverviewApi := new(api.OverviewApi)
	JobApi := new(api.JobApi)
	SecurityApi := new(api.SecurityApi)
	StorageApi := new(api.StorageApi)
	StrategyApi := new(api.StrategyApi)
	AccessGatewayApi := new(api.AccessGatewayApi)
	BackupApi := new(api.BackupApi)
	TenantApi := new(api.TenantApi)
	RoleApi := new(api.RoleApi)
	LoginPolicyApi := new(api.LoginPolicyApi)
	StorageLogApi := new(api.StorageLogApi)
	AuthorisedApi := new(api.AuthorisedApi)

	AiApi := new(api.AiApi)
	TranslationsApi := new(api.TranslationsApi)

	e.POST("/login", accountApi.LoginEndpoint)

	e.GET("/trans/:lng", TranslationsApi.GetTranslations)
	e.GET("/i18n", TranslationsApi.GetI18nEndpoint)

	account := e.Group("/account")
	{
		account.GET("/info", accountApi.InfoEndpoint)
		account.GET("/storage", accountApi.AccountStorageEndpoint)
		account.POST("/logout", accountApi.LogoutEndpoint)
		account.POST("/change-password", accountApi.ChangePasswordEndpoint)
		account.POST("/change-proxy-auth", accountApi.ChangeProxyAuthEndpoint)
		account.GET("/reload-totp", accountApi.ReloadTOTPEndpoint)
		account.POST("/reset-totp", accountApi.ResetTOTPEndpoint)
		account.POST("/confirm-totp", accountApi.ConfirmTOTPEndpoint)
		account.GET("/access-token", accountApi.AccessTokenGetEndpoint)
		account.POST("/access-token", accountApi.AccessTokenGenEndpoint)
		account.DELETE("/access-token", accountApi.AccessTokenDelEndpoint)
	}

	_worker := e.Group("/worker")
	{
		ai := _worker.Group("/ai")
		{
			ai.PUT("/ask", AiApi.AskEndpoint)
		}
		commands := _worker.Group("/commands")
		{
			workerCommandApi := new(worker.WorkCommandApi)
			commands.GET("", workerCommandApi.CommandAllEndpoint)
			commands.GET("/paging", workerCommandApi.CommandPagingEndpoint)
			commands.POST("", workerCommandApi.CommandCreateEndpoint)
			commands.POST("/import", workerCommandApi.CommandImportEndpoint)
			commands.PUT("/:id", workerCommandApi.CommandUpdateEndpoint)
			commands.DELETE("/:id", workerCommandApi.CommandDeleteEndpoint)
			commands.GET("/:id", workerCommandApi.CommandGetEndpoint)
		}

		sqls := _worker.Group("/sqls")
		{
			// workSqlsApi := new(worker.WorkSqlsApi)
			sqls.GET("", SqlsApi.SqlsAllEndpoint)
			sqls.GET("/paging", SqlsApi.SqlsPagingEndpoint)
			sqls.POST("", SqlsApi.SqlsCreateEndpoint)
			sqls.PUT("/:id", SqlsApi.SqlsUpdateEndpoint)
			sqls.DELETE("/:id", SqlsApi.SqlsDeleteEndpoint)
			sqls.GET("/:id", SqlsApi.SqlsGetEndpoint)
			sqls.POST("/:id/change-owner", SqlsApi.SqlsChangeOwnerEndpoint, mw.Admin)
			sqls.POST("/createOrUpdate", SqlsApi.SqlsCreateOrUpdateEndpoint)
			sqls.GET("/getId", SqlsApi.SqlsGetIdEndpoint)
		}

		assets := _worker.Group("/assets")
		{
			workAssetApi := new(worker.WorkAssetApi)
			assets.GET("/tree", workAssetApi.PagingTreeEndpoint)
			assets.GET("/paging", workAssetApi.PagingEndpoint)
			assets.GET("/tags", workAssetApi.TagsEndpoint)
			assets.GET("/:id/gateway", workAssetApi.GatewayEndpoint)
			assets.GET("/types", workAssetApi.AssetTypeEndpoint)
		}

		translations := _worker.Group("/translations")
		{
			translations.GET("/langs", TranslationsApi.GetLangsEndpoint)
		}
	}

	users := e.Group("/users", mw.Admin)
	{
		users.GET("", UserApi.AllEndpoint)
		users.GET("/paging", UserApi.PagingEndpoint)
		users.POST("", UserApi.CreateEndpoint)
		users.PUT("/:id", UserApi.UpdateEndpoint)
		users.PATCH("/:id/status", UserApi.UpdateStatusEndpoint)
		users.DELETE("/:id", UserApi.DeleteEndpoint)
		users.GET("/:id", UserApi.GetEndpoint)
		users.POST("/:id/change-password", UserApi.ChangePasswordEndpoint)
		users.POST("/:id/change-proxy-auth", UserApi.ChangeProxyAuthEndpoint)
		users.POST("/:id/reset-totp", UserApi.ResetTotpEndpoint)
	}

	userGroups := e.Group("/user-groups", mw.Admin)
	{
		userGroups.POST("", UserGroupApi.UserGroupCreateEndpoint)
		userGroups.GET("", UserGroupApi.UserGroupAllEndpoint)
		userGroups.GET("/paging", UserGroupApi.UserGroupPagingEndpoint)
		userGroups.PUT("/:id", UserGroupApi.UserGroupUpdateEndpoint)
		userGroups.DELETE("/:id", UserGroupApi.UserGroupDeleteEndpoint)
		userGroups.GET("/:id", UserGroupApi.UserGroupGetEndpoint)
		userGroups.PATCH("/:id/status", UserGroupApi.UpdateStatusEndpoint)
	}

	dbmAssets := e.Group("/dbm-assets", mw.Admin)
	{
		dbmAssets.GET("", DBMAssetApi.DBMAssetAllEndpoint)
		dbmAssets.POST("", DBMAssetApi.DBMAssetCreateEndpoint)
		dbmAssets.POST("/import", DBMAssetApi.DBMAssetImportEndpoint)
		dbmAssets.GET("/paging", DBMAssetApi.DBMAssetPagingEndpoint)
		dbmAssets.POST("/:id/tcping", DBMAssetApi.DBMAssetTcpingEndpoint)
		dbmAssets.PUT("/:id", DBMAssetApi.DBMAssetUpdateEndpoint)
		dbmAssets.GET("/:id", DBMAssetApi.DBMAssetGetEndpoint)
		dbmAssets.DELETE("/:id", DBMAssetApi.DBMAssetDeleteEndpoint)
		dbmAssets.POST("/:id/change-owner", DBMAssetApi.DBMAssetChangeOwnerEndpoint)
		dbmAssets.GET("/tree", DBMAssetApi.DBMAssetPagingTreeEndpoint)
	}

	sqls := e.Group("/sqls", mw.Admin)
	{
		sqls.GET("", SqlsApi.SqlsAllEndpoint)
		sqls.GET("/paging", SqlsApi.SqlsPagingEndpoint)
		sqls.POST("", SqlsApi.SqlsCreateEndpoint)
		sqls.PUT("/:id", SqlsApi.SqlsUpdateEndpoint)
		sqls.DELETE("/:id", SqlsApi.SqlsDeleteEndpoint)
		sqls.GET("/:id", SqlsApi.SqlsGetEndpoint)
		sqls.POST("/:id/change-owner", SqlsApi.SqlsChangeOwnerEndpoint, mw.Admin)
		sqls.POST("/createOrUpdate", SqlsApi.SqlsCreateOrUpdateEndpoint)
		sqls.GET("/getId", SqlsApi.SqlsGetIdEndpoint)
	}

	assets := e.Group("/assets", mw.Admin)
	{

		assets.GET("", AssetApi.AssetAllEndpoint)
		assets.POST("", AssetApi.AssetCreateEndpoint)
		assets.POST("/import", AssetApi.AssetImportEndpoint)
		assets.GET("/paging", AssetApi.AssetPagingEndpoint)
		assets.POST("/:id/tcping", AssetApi.AssetTcpingEndpoint)
		assets.PUT("/:id", AssetApi.AssetUpdateEndpoint)
		assets.GET("/:id", AssetApi.AssetGetEndpoint)
		assets.DELETE("/:id", AssetApi.AssetDeleteEndpoint)
		assets.POST("/:id/change-owner", AssetApi.AssetChangeOwnerEndpoint)
		assets.GET("/tree", AssetApi.AssetPagingTreeEndpoint)
		assets.GET("/:id/gateway", AssetApi.GatewayEndpoint)
		assets.GET("/:id/:userid/gatewaybyuserid", AssetApi.GatewayByUserIdEndpoint)
		assets.GET("/:id/databases", AssetApi.GetDatabasesEndpoint)
		assets.GET("/:id/:database/tables", AssetApi.GetTablesEndpoint)
		assets.GET("/types", AssetApi.AssetTypeEndpoint)
	}

	e.GET("/tags", AssetApi.AssetTagsEndpoint)

	commands := e.Group("/commands", mw.Admin)
	{
		commands.GET("", CommandApi.CommandAllEndpoint)
		commands.GET("/paging", CommandApi.CommandPagingEndpoint)
		commands.POST("", CommandApi.CommandCreateEndpoint)
		commands.POST("/import", CommandApi.CommandImportEndpoint)
		commands.PUT("/:id", CommandApi.CommandUpdateEndpoint)
		commands.DELETE("/:id", CommandApi.CommandDeleteEndpoint)
		commands.GET("/:id", CommandApi.CommandGetEndpoint)
		commands.POST("/:id/change-owner", CommandApi.CommandChangeOwnerEndpoint, mw.Admin)
	}

	credentials := e.Group("/credentials", mw.Admin)
	{
		credentials.GET("", CredentialApi.CredentialAllEndpoint)
		credentials.GET("/paging", CredentialApi.CredentialPagingEndpoint)
		credentials.POST("", CredentialApi.CredentialCreateEndpoint)
		credentials.PUT("/:id", CredentialApi.CredentialUpdateEndpoint)
		credentials.DELETE("/:id", CredentialApi.CredentialDeleteEndpoint)
		credentials.GET("/:id", CredentialApi.CredentialGetEndpoint)
		credentials.POST("/:id/change-owner", CredentialApi.CredentialChangeOwnerEndpoint)
	}

	sessions := e.Group("/sessions")
	{
		sessions.GET("/paging", mw.Admin(SessionApi.SessionPagingEndpoint))
		sessions.POST("/:id/disconnect", mw.Admin(SessionApi.SessionDisconnectEndpoint))
		sessions.DELETE("/:id", mw.Admin(SessionApi.SessionDeleteEndpoint))
		sessions.GET("/:id/recording", mw.Admin(SessionApi.SessionRecordingEndpoint))
		sessions.GET("/:id", mw.Admin(SessionApi.SessionGetEndpoint))
		sessions.POST("/:id/reviewed", mw.Admin(SessionApi.SessionReviewedEndpoint))
		sessions.POST("/:id/unreviewed", mw.Admin(SessionApi.SessionUnViewedEndpoint))
		sessions.POST("/clear", mw.Admin(SessionApi.SessionClearEndpoint))
		sessions.POST("/reviewed", mw.Admin(SessionApi.SessionReviewedAllEndpoint))

		sessions.POST("", SessionApi.SessionCreateEndpoint)
		sessions.POST("/:id/connect", SessionApi.SessionConnectEndpoint)
		sessions.GET("/:id/tunnel", guacamoleApi.Guacamole)
		sessions.GET("/:id/tunnel-monitor", guacamoleApi.GuacamoleMonitor)
		sessions.GET("/:id/ssh", webTerminalApi.SshEndpoint)
		sessions.GET("/:id/ssh-monitor", webTerminalApi.SshMonitorEndpoint)
		sessions.POST("/:id/resize", SessionApi.SessionResizeEndpoint)
		sessions.GET("/:id/stats", SessionApi.SessionStatsEndpoint)

		sessions.POST("/:id/ls", SessionApi.SessionLsEndpoint)
		sessions.GET("/:id/download", SessionApi.SessionDownloadEndpoint)
		sessions.POST("/:id/upload", SessionApi.SessionUploadEndpoint)
		sessions.POST("/:id/edit", SessionApi.SessionEditEndpoint)
		sessions.POST("/:id/mkdir", SessionApi.SessionMkDirEndpoint)
		sessions.POST("/:id/rm", SessionApi.SessionRmEndpoint)
		sessions.POST("/:id/rename", SessionApi.SessionRenameEndpoint)
	}

	loginLogs := e.Group("login-logs", mw.Admin)
	{
		loginLogs.GET("/paging", LoginLogApi.LoginLogPagingEndpoint)
		loginLogs.DELETE("/:id", LoginLogApi.LoginLogDeleteEndpoint)
		loginLogs.POST("/clear", LoginLogApi.LoginLogClearEndpoint)
	}

	sqlLogs := e.Group("sql-logs", mw.Admin)
	{
		sqlLogs.POST("", SqlLogApi.SqlLogCreateEndpoint)
		sqlLogs.GET("/paging", SqlLogApi.SqlLogPagingEndpoint)
		sqlLogs.DELETE("/:id", SqlLogApi.SqlLogDeleteEndpoint)
		sqlLogs.POST("/clear", SqlLogApi.SqlLogClearEndpoint)
	}

	operLogs := e.Group("oper-logs", mw.Admin)
	{
		operLogs.GET("/paging", OperLogApi.OperLogPagingEndpoint)
		operLogs.DELETE("/:id", OperLogApi.OperLogDeleteEndpoint)
		operLogs.POST("/clear", OperLogApi.OperLogClearEndpoint)
	}

	storageLogs := e.Group("storage-logs", mw.Admin)
	{
		storageLogs.GET("/paging", StorageLogApi.PagingEndpoint)
		storageLogs.DELETE("/:id", StorageLogApi.DeleteEndpoint)
		storageLogs.POST("/clear", StorageLogApi.ClearEndpoint)
	}

	properties := e.Group("properties", mw.Admin)
	{
		properties.GET("", PropertyApi.PropertyGetEndpoint)
		properties.PUT("", PropertyApi.PropertyUpdateEndpoint)

		properties.POST("/ldap-user-sync", PropertyApi.PropertyLdapUserSyncEndpoint)

		properties.GET("/app/restart", PropertyApi.PropertyRestartAppEndpoint)
		properties.GET("/app/status", PropertyApi.PropertyStatusAppEndpoint)
		properties.GET("/app/stop", PropertyApi.PropertyStopAppEndpoint)

		properties.GET("/app/checkVersion", PropertyApi.PropertyCheckVersionEndpoint)
		properties.GET("/app/upgrade", PropertyApi.PropertyUpgradeAppEndpoint)
		properties.GET("/app/upgradeFinish", PropertyApi.PropertyUpgradeFinishAppEndpoint)

		properties.GET("/mariaDBServer/start/:port", PropertyApi.PropertyMariaDBProxyStartEndpoint)
		properties.GET("/mariaDBServer/stop", PropertyApi.PropertyMariaDBProxyStopEndpoint)
		properties.GET("/mariaDBServer/status", PropertyApi.PropertyMariaDBProxyStatusEndpoint)

	}

	translations := e.Group("translations", mw.Admin)
	{
		translations.GET("/langs", TranslationsApi.GetLangsEndpoint)
		translations.GET("/export", TranslationsApi.TranslationsExportEndpoint)
		translations.POST("/import", TranslationsApi.TranslationsImportEndpoint)

	}

	overview := e.Group("overview", mw.Admin)
	{
		overview.GET("/counter", OverviewApi.OverviewCounterEndPoint)
		overview.GET("/asset", OverviewApi.OverviewAssetEndPoint)
		overview.GET("/date-counter", OverviewApi.OverviewDateCounterEndPoint)
		overview.GET("/ps", OverviewApi.OverviewPS)
	}

	jobs := e.Group("/jobs", mw.Admin)
	{
		jobs.POST("", JobApi.JobCreateEndpoint)
		jobs.GET("/paging", JobApi.JobPagingEndpoint)
		jobs.PUT("/:id", JobApi.JobUpdateEndpoint)
		jobs.POST("/:id/change-status", JobApi.JobChangeStatusEndpoint)
		jobs.POST("/:id/exec", JobApi.JobExecEndpoint)
		jobs.DELETE("/:id", JobApi.JobDeleteEndpoint)
		jobs.GET("/:id", JobApi.JobGetEndpoint)

		jobs.GET("/:id/logs/paging", JobApi.JobGetLogsEndpoint)
		jobs.DELETE("/:id/logs", JobApi.JobDeleteLogsEndpoint)
	}

	securities := e.Group("/securities", mw.Admin)
	{
		securities.POST("", SecurityApi.SecurityCreateEndpoint)
		securities.GET("/paging", SecurityApi.SecurityPagingEndpoint)
		securities.PUT("/:id", SecurityApi.SecurityUpdateEndpoint)
		securities.DELETE("/:id", SecurityApi.SecurityDeleteEndpoint)
		securities.GET("/:id", SecurityApi.SecurityGetEndpoint)
	}

	storages := e.Group("/storages")
	{
		storages.GET("/paging", StorageApi.StoragePagingEndpoint, mw.Admin)
		storages.POST("", StorageApi.StorageCreateEndpoint, mw.Admin)
		storages.DELETE("/:id", StorageApi.StorageDeleteEndpoint, mw.Admin)
		storages.PUT("/:id", StorageApi.StorageUpdateEndpoint, mw.Admin)
		storages.GET("/shares", StorageApi.StorageSharesEndpoint, mw.Admin)
		storages.GET("/:id", StorageApi.StorageGetEndpoint, mw.Admin)

		storages.POST("/:storageId/ls", StorageApi.StorageLsEndpoint)
		storages.GET("/:storageId/download", StorageApi.StorageDownloadEndpoint)
		storages.POST("/:storageId/upload", StorageApi.StorageUploadEndpoint)
		storages.POST("/:storageId/mkdir", StorageApi.StorageMkDirEndpoint)
		storages.POST("/:storageId/rm", StorageApi.StorageRmEndpoint)
		storages.POST("/:storageId/rename", StorageApi.StorageRenameEndpoint)
		storages.POST("/:storageId/edit", StorageApi.StorageEditEndpoint)
	}

	strategies := e.Group("/strategies", mw.Admin)
	{
		strategies.GET("", StrategyApi.StrategyAllEndpoint)
		strategies.GET("/paging", StrategyApi.StrategyPagingEndpoint)
		strategies.POST("", StrategyApi.StrategyCreateEndpoint)
		strategies.DELETE("/:id", StrategyApi.StrategyDeleteEndpoint)
		strategies.PUT("/:id", StrategyApi.StrategyUpdateEndpoint)
		strategies.GET("/:id", StrategyApi.GetEndpoint)
	}

	accessGateways := e.Group("/access-gateways", mw.Admin)
	{
		accessGateways.GET("", AccessGatewayApi.AccessGatewayAllEndpoint)
		accessGateways.POST("", AccessGatewayApi.AccessGatewayCreateEndpoint)
		accessGateways.GET("/paging", AccessGatewayApi.AccessGatewayPagingEndpoint)
		accessGateways.PUT("/:id", AccessGatewayApi.AccessGatewayUpdateEndpoint)
		accessGateways.DELETE("/:id", AccessGatewayApi.AccessGatewayDeleteEndpoint)
		accessGateways.GET("/:id", AccessGatewayApi.AccessGatewayGetEndpoint)
	}

	backup := e.Group("/backup", mw.Admin)
	{
		backup.GET("/export", BackupApi.BackupExportEndpoint)
		backup.POST("/import", BackupApi.BackupImportEndpoint)
	}

	tenants := e.Group("/tenants", mw.Admin)
	{
		tenants.GET("", TenantApi.AllEndpoint)
		tenants.GET("/paging", TenantApi.PagingEndpoint)
		tenants.POST("", TenantApi.CreateEndpoint)
		tenants.DELETE("/:id", TenantApi.DeleteEndpoint)
		tenants.PUT("/:id", TenantApi.UpdateEndpoint)
	}

	roles := e.Group("/roles", mw.Admin)
	{
		roles.GET("", RoleApi.AllEndpoint)
		roles.GET("/paging", RoleApi.PagingEndpoint)
		roles.GET("/:id", RoleApi.GetEndpoint)
		roles.POST("", RoleApi.CreateEndpoint)
		roles.DELETE("/:id", RoleApi.DeleteEndpoint)
		roles.PUT("/:id", RoleApi.UpdateEndpoint)
	}

	loginPolicies := e.Group("/login-policies", mw.Admin)
	{
		loginPolicies.GET("/paging", LoginPolicyApi.PagingEndpoint)
		loginPolicies.GET("/:id", LoginPolicyApi.GetEndpoint)
		loginPolicies.GET("/:id/users/paging", LoginPolicyApi.GetUserPageEndpoint)
		loginPolicies.GET("/:id/users/id", LoginPolicyApi.GetUserIdEndpoint)
		loginPolicies.POST("", LoginPolicyApi.CreateEndpoint)
		loginPolicies.DELETE("/:id", LoginPolicyApi.DeleteEndpoint)
		loginPolicies.PUT("/:id", LoginPolicyApi.UpdateEndpoint)
		loginPolicies.POST("/:id/bind", LoginPolicyApi.BindEndpoint)
		loginPolicies.POST("/:id/unbind", LoginPolicyApi.UnbindEndpoint)
	}

	authorised := e.Group("/authorised", mw.Admin)
	{
		authorised.GET("/assets/paging", AuthorisedApi.PagingAsset)
		authorised.GET("/users/paging", AuthorisedApi.PagingUser)
		authorised.GET("/user-groups/paging", AuthorisedApi.PagingUserGroup)
		authorised.GET("/selected", AuthorisedApi.Selected)
		authorised.POST("/assets", AuthorisedApi.AuthorisedAssets)
		authorised.POST("/users", AuthorisedApi.AuthorisedUsers)
		authorised.POST("/user-groups", AuthorisedApi.AuthorisedUserGroups)
		authorised.DELETE("/:id", AuthorisedApi.Delete)
		authorised.PATCH("/:id/webhookPushstatus", AuthorisedApi.UpdateWebhookPushStatusEndpoint)
	}

	e.GET("/menus", RoleApi.TreeMenus, mw.Admin)

	return e
}
