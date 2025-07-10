package templates

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"github.com/AoyamaRito/enkai/internal/types"
)

// プリセットテンプレートをembed
var (
	//go:embed presets/game-components.json
	gameComponentsJSON string

	//go:embed presets/web-app.json
	webAppJSON string
)

// プリセットマップ
var presets = map[string]string{
	"game-components": gameComponentsJSON,
	"web-app":        webAppJSON,
}

// GetPreset は指定された名前のプリセットを取得
func GetPreset(name string) ([]types.Task, error) {
	jsonStr, exists := presets[name]
	if !exists {
		return nil, fmt.Errorf("プリセット '%s' が見つかりません", name)
	}

	var tasks []types.Task
	if err := json.Unmarshal([]byte(jsonStr), &tasks); err != nil {
		return nil, fmt.Errorf("プリセットのパースに失敗: %w", err)
	}

	return tasks, nil
}

// ListPresets は利用可能なプリセット一覧を返す
func ListPresets() []string {
	names := make([]string, 0, len(presets))
	for name := range presets {
		names = append(names, name)
	}
	return names
}