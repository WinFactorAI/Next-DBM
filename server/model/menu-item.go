package model

type MenuItem struct {
	Title string `json:"title"`
	Key   string `json:"key"`
	// Icon     string      `json:"icon"`
	MenuType string      `json:"menuType"`
	Children []MenuItem  `json:"children"`
	IsLeaf   bool        `json:"isLeaf"`
	Attr     interface{} `json:"attr"`
}
