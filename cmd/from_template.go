package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/AoyamaRito/enkai/internal/executor"
	"github.com/AoyamaRito/enkai/internal/templates"
	"github.com/AoyamaRito/enkai/internal/types"
	"github.com/spf13/cobra"
)

func newFromTemplateCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "from-template [template-name or json-file]",
		Short: "テンプレートまたはJSONファイルからタスクを実行",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			input := args[0]
			
			// APIキーの取得
			apiKey := getAPIKey()
			if apiKey == "" {
				return fmt.Errorf("GEMINI_API_KEY環境変数が設定されていません")
			}

			// JSONファイルかテンプレート名かを判定
			var tasks []types.Task
			if filepath.Ext(input) == ".json" {
				// JSONファイルを読み込む
				data, err := os.ReadFile(input)
				if err != nil {
					return fmt.Errorf("JSONファイルの読み込みに失敗: %w", err)
				}
				
				if err := json.Unmarshal(data, &tasks); err != nil {
					return fmt.Errorf("JSONのパースに失敗: %w", err)
				}
			} else {
				// テンプレートから読み込む
				var err error
				tasks, err = templates.GetPreset(input)
				if err != nil {
					return fmt.Errorf("テンプレートの読み込みに失敗: %w", err)
				}
			}

			// コンペティションモードかどうかで実行方法を切り替え
			if isCompetitionMode(cmd) {
				// コンペティションモード（デフォルト）
				var compExec *executor.CompetitionExecutor
				if isProMode(cmd) {
					compExec = executor.NewProCompetitionExecutor(apiKey, getConcurrency(cmd))
				} else {
					compExec = executor.NewCompetitionExecutor(apiKey, getConcurrency(cmd), getModels(cmd))
				}
				compResults := compExec.ExecuteParallel(tasks)
				
				// サマリー表示
				fmt.Println("\n📊 コンペティション結果サマリー:")
				successCount := 0
				for _, result := range compResults {
					if result.BestResult != nil && result.BestResult.Error == nil {
						successCount++
						fmt.Printf("✅ %s: 優勝モデル = %s\n", result.Task.FileName, result.BestResult.Model)
					} else {
						fmt.Printf("❌ %s: 全モデル失敗\n", result.Task.FileName)
					}
				}
				fmt.Printf("\n成功率: %d/%d タスク\n", successCount, len(tasks))
			} else {
				// 通常モード（単一モデル）
				exec := executor.New(apiKey, getConcurrency(cmd))
				results := exec.ExecuteParallel(tasks)
				
				// 結果を表示
				for _, result := range results {
					if result.Error != nil {
						fmt.Printf("❌ %s: %v\n", result.Task.FileName, result.Error)
					} else {
						fmt.Printf("✅ %s: 成功\n", result.Task.FileName)
					}
				}
			}

			return nil
		},
	}
}

