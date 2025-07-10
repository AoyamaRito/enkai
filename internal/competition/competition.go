package competition

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/AoyamaRito/enkai/internal/gemini"
	"github.com/AoyamaRito/enkai/internal/types"
)

// Competitor は複数モデルでの競争実行を管理
type Competitor struct {
	apiKey string
	models []string
}

// NewCompetitor は新しいCompetitorを作成
func NewCompetitor(apiKey string, models []string) *Competitor {
	if len(models) == 0 {
		// Gemini 2.0 Flashのみ使用するため、コンペティション不要
		models = gemini.AvailableModels
	}
	return &Competitor{
		apiKey: apiKey,
		models: models,
	}
}

// CompeteTask は複数モデルでタスクを実行し最良の結果を選択
func (c *Competitor) CompeteTask(task types.Task) types.CompetitionResult {
	// Gemini 2.0 Flashを異なるモードで実行
	modes := []gemini.GenerationMode{
		gemini.ModeNormal,
		gemini.ModeStrict,
		gemini.ModeCreative,
	}
	modeNames := []string{
		"gemini-2.0-flash (通常モード)",
		"gemini-2.0-flash (Strictモード)",
		"gemini-2.0-flash (クリエイティブモード)",
	}
	
	results := make([]types.ModelResult, len(modes))
	var wg sync.WaitGroup
	
	fmt.Printf("\n🏁 コンペティション開始: %s\n", task.FileName)
	fmt.Printf("実行モード: %s\n\n", strings.Join(modeNames, ", "))

	// 各モードで並列実行
	for i, mode := range modes {
		wg.Add(1)
		go func(index int, genMode gemini.GenerationMode, modeName string) {
			defer wg.Done()
			
			startTime := time.Now()
			fmt.Printf("🤖 %s 実行中...\n", modeName)
			
			client := gemini.NewClientWithMode(c.apiKey, genMode)
			content, err := client.GenerateContent(task.Prompt)
			
			duration := time.Since(startTime)
			
			results[index] = types.ModelResult{
				Model:    modeName,
				Content:  content,
				Error:    err,
				Duration: duration,
			}
			
			if err != nil {
				fmt.Printf("❌ %s 失敗: %v\n", modeName, err)
			} else {
				fmt.Printf("✅ %s 完了 (%.2fs)\n", modeName, duration.Seconds())
			}
		}(i, mode, modeNames[i])
	}
	
	wg.Wait()
	
	// 結果を評価して最良を選択
	bestResult, reason := c.evaluateResults(results)
	
	return types.CompetitionResult{
		Task:            task,
		Results:         results,
		BestResult:      bestResult,
		SelectionReason: reason,
	}
}

// evaluateResults は結果を評価し最良のものを選択
func (c *Competitor) evaluateResults(results []types.ModelResult) (*types.ModelResult, string) {
	var validResults []types.ModelResult
	
	// エラーのない結果を収集
	for _, result := range results {
		if result.Error == nil && result.Content != "" {
			// スコア計算
			result.Score = c.calculateScore(result)
			validResults = append(validResults, result)
		}
	}
	
	if len(validResults) == 0 {
		return nil, "全てのモデルが失敗しました"
	}
	
	// スコアが最も高い結果を選択
	best := &validResults[0]
	for i := 1; i < len(validResults); i++ {
		if validResults[i].Score > best.Score {
			best = &validResults[i]
		}
	}
	
	// モードごとの選択理由を詳細化
	modeReason := ""
	if strings.Contains(best.Model, "Strict") {
		modeReason = "厳密で一貫性のあるコード生成"
	} else if strings.Contains(best.Model, "クリエイティブ") {
		modeReason = "革新的なアプローチとコード構造"
	} else {
		modeReason = "バランスの取れた実装"
	}
	
	reason := fmt.Sprintf(
		"モード: %s | スコア: %.2f | 実行時間: %.2fs | 理由: %s",
		best.Model, best.Score, best.Duration.Seconds(), modeReason,
	)
	
	return best, reason
}

// calculateScore は結果のスコアを計算
func (c *Competitor) calculateScore(result types.ModelResult) float64 {
	score := 100.0
	
	// コンテンツ長による評価（適切な長さが好ましい）
	contentLen := len(result.Content)
	if contentLen < 100 {
		score -= 20 // 短すぎる
	} else if contentLen > 10000 {
		score -= 10 // 長すぎる
	}
	
	// 実行時間による評価（速いほど良い）
	if result.Duration < 2*time.Second {
		score += 10
	} else if result.Duration > 10*time.Second {
		score -= 20
	}
	
	// TypeScript/React構文の存在チェック
	requiredPatterns := []string{
		"export",
		"function",
		"const",
		"return",
		"useState",
		"import",
	}
	
	for _, pattern := range requiredPatterns {
		if strings.Contains(result.Content, pattern) {
			score += 5
		}
	}
	
	// AI-First原則の遵守チェック
	if strings.Contains(result.Content, "import {") && 
	   !strings.Contains(result.Content, "from 'react'") {
		score -= 15 // 外部依存がある
	}
	
	return score
}