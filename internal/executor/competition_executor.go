package executor

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/AoyamaRito/enkai/internal/competition"
	"github.com/AoyamaRito/enkai/internal/types"
)

// CompetitionExecutor はコンペティションモードでタスクを実行
type CompetitionExecutor struct {
	apiKey      string
	concurrency int
	models      []string
	isPro       bool
}

// NewCompetitionExecutor は新しいCompetitionExecutorを作成
func NewCompetitionExecutor(apiKey string, concurrency int, models []string) *CompetitionExecutor {
	return &CompetitionExecutor{
		apiKey:      apiKey,
		concurrency: concurrency,
		models:      models,
		isPro:       false,
	}
}

// NewProCompetitionExecutor はProモデル用のCompetitionExecutorを作成
func NewProCompetitionExecutor(apiKey string, concurrency int) *CompetitionExecutor {
	return &CompetitionExecutor{
		apiKey:      apiKey,
		concurrency: concurrency,
		models:      []string{"gemini-2.0-pro"},
		isPro:       true,
	}
}

// ExecuteParallel は複数のタスクをコンペティションモードで並列実行
func (e *CompetitionExecutor) ExecuteParallel(tasks []types.Task) []types.CompetitionResult {
	results := make([]types.CompetitionResult, len(tasks))
	var wg sync.WaitGroup
	
	// タスクレベルの並列実行（各タスク内でモデル間競争）
	semaphore := make(chan struct{}, e.concurrency)
	
	fmt.Printf("🏆 コンペティションモード: %d個のタスクを実行\n", len(tasks))
	fmt.Printf("🤖 参加モデル数: %d\n\n", len(e.models))

	for i, task := range tasks {
		wg.Add(1)
		go func(index int, t types.Task) {
			defer wg.Done()
			
			// セマフォ取得
			semaphore <- struct{}{}
			defer func() { <-semaphore }()
			
			// コンペティション実行
			var competitor *competition.Competitor
			if e.isPro {
				competitor = competition.NewProCompetitor(e.apiKey)
			} else {
				competitor = competition.NewCompetitor(e.apiKey, e.models)
			}
			result := competitor.CompeteTask(t)
			results[index] = result
			
			// 最良の結果をファイルに保存
			if result.BestResult != nil && result.BestResult.Error == nil {
				if err := e.saveResult(t, result.BestResult.Content); err != nil {
					fmt.Printf("❌ ファイル保存エラー: %s - %v\n", t.FileName, err)
				} else {
					fmt.Printf("\n🏆 優勝: %s -> %s\n", result.BestResult.Model, t.OutputPath)
					fmt.Printf("📝 選定理由: %s\n", result.SelectionReason)
				}
			} else {
				fmt.Printf("\n❌ 失敗: %s - 有効な結果が得られませんでした\n", t.FileName)
			}
			
			fmt.Println(strings.Repeat("-", 80))
		}(i, task)
	}
	
	wg.Wait()
	fmt.Println("\n🎉 全コンペティション完了！")
	
	return results
}

// saveResult は結果をファイルに保存
func (e *CompetitionExecutor) saveResult(task types.Task, content string) error {
	// 出力ディレクトリ作成
	dir := filepath.Dir(task.OutputPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("ディレクトリ作成エラー: %w", err)
	}
	
	// ファイル書き込み
	if err := os.WriteFile(task.OutputPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("ファイル書き込みエラー: %w", err)
	}
	
	return nil
}