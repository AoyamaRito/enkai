package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/AoyamaRito/enkai/internal/executor"
	"github.com/AoyamaRito/enkai/internal/types"
	"github.com/spf13/cobra"
)

func newFromJSONCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "from-json [json-string]",
		Short: "JSON文字列から直接タスクを実行",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonStr := args[0]
			
			// APIキーの取得
			apiKey := getAPIKey()
			if apiKey == "" {
				return fmt.Errorf("GEMINI_API_KEY環境変数が設定されていません")
			}

			// JSONをパース
			var tasks []types.Task
			if err := json.Unmarshal([]byte(jsonStr), &tasks); err != nil {
				return fmt.Errorf("JSONのパースに失敗: %w", err)
			}

			// コンペティションモードかどうかで実行方法を切り替え
			if isCompetitionMode(cmd) {
				// コンペティションモード（デフォルト）
				compExec := executor.NewCompetitionExecutor(apiKey, getConcurrency(cmd), getModels(cmd))
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
				successCount := 0
				for _, result := range results {
					if result.Error != nil {
						fmt.Printf("❌ %s: %v\n", result.Task.FileName, result.Error)
					} else {
						fmt.Printf("✅ %s: %s に生成完了\n", result.Task.FileName, result.Task.OutputPath)
						successCount++
					}
				}
				
				fmt.Printf("\n📊 実行結果: %d/%d タスクが成功\n", successCount, len(tasks))
			}

			return nil
		},
	}
}