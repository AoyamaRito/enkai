package analyzer

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/AoyamaRito/enkai/internal/gemini"
)

// Analyzer はコード分析機能を提供
type Analyzer struct {
	config  Config
	scanner *Scanner
}

// New は新しいAnalyzerを作成
func New(config Config) *Analyzer {
	return &Analyzer{
		config:  config,
		scanner: NewScanner(config),
	}
}

// Run は分析を実行
func (a *Analyzer) Run() error {
	startTime := time.Now()

	// ファイルスキャン
	fmt.Println("📂 ファイルをスキャン中...")
	files, err := a.scanner.ScanFiles()
	if err != nil {
		return fmt.Errorf("ファイルスキャンエラー: %w", err)
	}

	if len(files) == 0 {
		return fmt.Errorf("分析対象のファイルが見つかりません")
	}

	fmt.Printf("✅ %d個のファイルを検出 (%.2fs)\n\n", len(files), time.Since(startTime).Seconds())

	// 分析実行
	result, err := a.analyze(files)
	if err != nil {
		return fmt.Errorf("分析エラー: %w", err)
	}

	// 結果表示
	output := a.formatResults(result)
	
	// ターミナルに表示
	fmt.Print(output)
	
	// ファイル出力
	if a.config.OutputFile != "" {
		if err := a.saveToFile(output); err != nil {
			return fmt.Errorf("ファイル保存エラー: %w", err)
		}
		fmt.Printf("\n\n📄 結果を保存しました: %s\n", a.config.OutputFile)
	}

	// 修正モード
	if a.config.Fix && len(result.Issues) > 0 {
		fmt.Println("\n🔧 問題の自動修正を開始...")
		if err := a.applyFixes(result); err != nil {
			return fmt.Errorf("修正エラー: %w", err)
		}
	}

	fmt.Printf("\n⏱️  完了時間: %.2fs\n", time.Since(startTime).Seconds())

	return nil
}

// analyze はファイルを分析
func (a *Analyzer) analyze(files []FileInfo) (*AnalysisResult, error) {
	// Geminiクライアント作成
	var client *gemini.Client
	if a.config.UsePro {
		client = gemini.NewProClientWithMode(a.config.APIKey, gemini.ModeNormal)
	} else {
		client = gemini.NewClientWithMode(a.config.APIKey, gemini.ModeNormal)
	}

	// プロンプト生成
	prompt := a.generatePrompt(files)

	// Geminiで分析
	fmt.Println("🤖 Gemini 2.0-Flashで分析中...")
	response, err := client.GenerateContent(prompt)
	if err != nil {
		return nil, err
	}

	// 結果をパース
	result := a.parseResponse(response)

	return result, nil
}

// generatePrompt は分析用のプロンプトを生成
func (a *Analyzer) generatePrompt(files []FileInfo) string {
	var prompt strings.Builder

	// 基本的な指示
	prompt.WriteString("以下のコードベースを分析してください。\n\n")

	// モード別の指示
	switch a.config.Mode {
	case AnalyzeModeArchitect:
		prompt.WriteString(`アーキテクチャ分析を行ってください：
- プロジェクトの全体構造
- 主要なコンポーネントとその関係
- 使用されているパターンとベストプラクティス
- 依存関係の分析
- 改善可能な点

`)
	case AnalyzeModeRefactor:
		prompt.WriteString(`リファクタリング候補を提案してください：
- 重複コードの検出
- 複雑すぎる関数やクラス
- 命名規則の改善点
- デッドコード
- パフォーマンス改善の機会

`)
	case AnalyzeModeSecurity:
		prompt.WriteString(`セキュリティ分析を行ってください：
- セキュリティホールの検出
- 脆弱な依存関係
- ハードコードされた機密情報
- 入力検証の不備
- 認証・認可の問題

`)
	case AnalyzeModePerformance:
		prompt.WriteString(`パフォーマンス分析を行ってください：
- ボトルネックの可能性
- 非効率なアルゴリズム
- メモリリーク
- 不要な再レンダリング
- 最適化の機会

`)
	default:
		// サマリーモード
		prompt.WriteString(`プロジェクトの概要を分析してください：
- プロジェクトの目的と機能
- 使用技術とフレームワーク
- コード品質の総評
- 主要な改善点

`)
	}

	// カスタムクエリ
	if a.config.Query != "" {
		prompt.WriteString(fmt.Sprintf("特に以下の観点で分析してください: %s\n\n", a.config.Query))
	}

	// ファイル情報の追加
	prompt.WriteString("\n対象ファイル:\n")
	for _, file := range files {
		prompt.WriteString(fmt.Sprintf("- %s (%s, %d bytes)\n", file.Path, file.Language, file.Size))
	}

	// コード内容を必ず追加（少なくとも分析対象は含める）
	prompt.WriteString("\n\n=== コード内容 ===\n")
	for i, file := range files {
		if i >= 10 { // 最大10ファイル
			break
		}
		prompt.WriteString(fmt.Sprintf("\n--- %s ---\n", file.Path))
		
		// コード内容（最大行数を調整）
		lines := strings.Split(file.Content, "\n")
		maxLines := 50
		if a.config.Verbosity > 0 {
			maxLines = 200
		}
		if a.config.Verbosity >= 2 {
			maxLines = 1000
		}
		
		for j, line := range lines {
			if j >= maxLines {
				prompt.WriteString("... (省略)\n")
				break
			}
			prompt.WriteString(fmt.Sprintf("%d: %s\n", j+1, line))
		}
	}

	// 出力形式の指定
	prompt.WriteString(`

以下の形式で分析結果を出力してください：

## サマリー
(プロジェクトの概要を簡潔に)

## 発見された問題
- [重要度] ファイル名:行番号 - 問題の説明

## 改善提案
- [タイプ] ファイル名 - 提案内容

## 詳細分析
(モードに応じた詳細な分析)
`)

	return prompt.String()
}

// parseResponse はGeminiのレスポンスをパース
func (a *Analyzer) parseResponse(response string) *AnalysisResult {
	result := &AnalysisResult{
		Summary:     "",
		Files:       []FileAnalysis{},
		Issues:      []Issue{},
		Suggestions: []Suggestion{},
	}

	// Geminiのレスポンスをそのまま使用（構造化は後で改善）
	lines := strings.Split(response, "\n")
	var currentSection string
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		// セクション判定
		if strings.HasPrefix(line, "## ") {
			currentSection = strings.TrimPrefix(line, "## ")
			continue
		}
		
		// セクションごとの処理
		switch currentSection {
		case "サマリー":
			if result.Summary != "" {
				result.Summary += "\n"
			}
			result.Summary += line
			
		case "発見された問題":
			if strings.HasPrefix(line, "- ") {
				// 簡易的な問題パース
				issue := Issue{
					Severity:    "medium",
					Type:        "issue",
					Description: strings.TrimPrefix(line, "- "),
				}
				result.Issues = append(result.Issues, issue)
			}
			
		case "改善提案":
			if strings.HasPrefix(line, "- ") {
				suggestion := Suggestion{
					Type:        "suggestion",
					Description: strings.TrimPrefix(line, "- "),
				}
				result.Suggestions = append(result.Suggestions, suggestion)
			}
		}
	}
	
	// レスポンス全体も保持（デバッグ用）
	if result.Summary == "" && len(result.Issues) == 0 && len(result.Suggestions) == 0 {
		// パースに失敗した場合は、レスポンス全体をサマリーとして使用
		result.Summary = response
	}

	return result
}

// formatResults は結果をフォーマット
func (a *Analyzer) formatResults(result *AnalysisResult) string {
	var output strings.Builder
	
	output.WriteString("📊 分析結果\n")
	output.WriteString(strings.Repeat("=", 80) + "\n")
	
	// サマリー表示
	if result.Summary != "" {
		output.WriteString("\n📝 サマリー:\n")
		output.WriteString(result.Summary + "\n")
	}

	// 問題の表示
	if len(result.Issues) > 0 {
		output.WriteString(fmt.Sprintf("\n⚠️  発見された問題 (%d件):\n", len(result.Issues)))
		for _, issue := range result.Issues {
			severity := a.getSeverityIcon(issue.Severity)
			output.WriteString(fmt.Sprintf("%s [%s] %s - %s\n", severity, issue.Type, issue.File, issue.Description))
		}
	}

	// 提案の表示
	if len(result.Suggestions) > 0 {
		output.WriteString(fmt.Sprintf("\n💡 改善提案 (%d件):\n", len(result.Suggestions)))
		for _, suggestion := range result.Suggestions {
			output.WriteString(fmt.Sprintf("• [%s] %s - %s\n", suggestion.Type, suggestion.File, suggestion.Description))
		}
	}
	
	return output.String()
}

// getSeverityIcon は重要度に応じたアイコンを返す
func (a *Analyzer) getSeverityIcon(severity string) string {
	switch severity {
	case "critical":
		return "🔴"
	case "high":
		return "🟠"
	case "medium":
		return "🟡"
	case "low":
		return "🟢"
	default:
		return "⚪"
	}
}

// applyFixes は修正を適用
func (a *Analyzer) applyFixes(result *AnalysisResult) error {
	// TODO: 修正の実装
	fmt.Println("修正機能は開発中です")
	return nil
}

// saveToFile は結果をファイルに保存
func (a *Analyzer) saveToFile(content string) error {
	file, err := os.Create(a.config.OutputFile)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.WriteString(content)
	return err
}