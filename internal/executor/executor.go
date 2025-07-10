package executor

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/AoyamaRito/enkai/internal/gemini"
	"github.com/AoyamaRito/enkai/internal/types"
)

// Executor はタスクの並列実行を管理
type Executor struct {
	apiKey      string
	concurrency int
}

// New は新しいExecutorを作成
func New(apiKey string, concurrency int) *Executor {
	return &Executor{
		apiKey:      apiKey,
		concurrency: concurrency,
	}
}

// ExecuteParallel は複数のタスクを並列実行
func (e *Executor) ExecuteParallel(tasks []types.Task) []types.ExecutionResult {
	results := make([]types.ExecutionResult, len(tasks))
	var wg sync.WaitGroup
	
	// セマフォで同時実行数を制限
	semaphore := make(chan struct{}, e.concurrency)
	
	fmt.Printf("🚀 %d個のタスクを並列度%dで実行開始...\n\n", len(tasks), e.concurrency)

	for i, task := range tasks {
		wg.Add(1)
		go func(index int, t types.Task) {
			defer wg.Done()
			
			// セマフォ取得
			semaphore <- struct{}{}
			defer func() { <-semaphore }()
			
			fmt.Printf("⚡ 実行中: %s\n", t.FileName)
			
			// タスク実行
			result := e.executeTask(t)
			results[index] = result
			
			if result.Error != nil {
				fmt.Printf("❌ 失敗: %s - %v\n", t.FileName, result.Error)
			} else {
				fmt.Printf("✅ 完了: %s\n", t.FileName)
			}
		}(i, task)
	}
	
	wg.Wait()
	fmt.Println("\n🎉 全タスク完了！")
	
	return results
}

// executeTask は単一タスクを実行
func (e *Executor) executeTask(task types.Task) types.ExecutionResult {
	client := gemini.NewClient(e.apiKey, "") // デフォルトモデル使用
	
	// Gemini APIでコンテンツ生成
	content, err := client.GenerateContent(task.Prompt)
	if err != nil {
		return types.ExecutionResult{
			Task:  task,
			Error: fmt.Errorf("コンテンツ生成エラー: %w", err),
		}
	}
	
	// 出力ディレクトリ作成
	dir := filepath.Dir(task.OutputPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return types.ExecutionResult{
			Task:  task,
			Error: fmt.Errorf("ディレクトリ作成エラー: %w", err),
		}
	}
	
	// ファイル書き込み
	if err := os.WriteFile(task.OutputPath, []byte(content), 0644); err != nil {
		return types.ExecutionResult{
			Task:  task,
			Error: fmt.Errorf("ファイル書き込みエラー: %w", err),
		}
	}
	
	return types.ExecutionResult{
		Task:    task,
		Content: content,
		Error:   nil,
	}
}