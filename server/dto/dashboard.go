package dto

type Counter struct {
	TotalUser           int64 `json:"totalUser"`
	OnlineUser          int64 `json:"onlineUser"`
	TotalAsset          int64 `json:"totalAsset"`
	ActiveAsset         int64 `json:"activeAsset"`
	OnlineSession       int64 `json:"onlineSession"`
	OfflineSession      int64 `json:"offlineSession"`
	FailLoginCount      int64 `json:"failLoginCount"`
	TotalSession        int64 `json:"totalSession"`
	TotalGit            int64 `json:"totalGit"`
	TotalBuild          int64 `json:"totalBuild"`
	BuildFailCount      int64 `json:"buildFailCount"`
	BuildSuccessCount   int64 `json:"buildSuccessCount"`
	TotalSensitive      int64 `json:"totalSensitive"`
	TotalSensitiveGroup int64 `json:"totalSensitiveGroup"`
	TotalTrigger        int64 `json:"totalTrigger"`
	TotalTriggerGroup   int64 `json:"totalTriggerGroup"`
	TotalProxy          int64 `json:"totalProxy"`
	TotalSqlLog         int64 `json:"totalSqlLog"`
	SqlLogSuccessCount  int64 `json:"sqlLogSuccessCount"`
}
