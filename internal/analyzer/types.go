package analyzer

// AnalyzeMode は分析モードの種類
type AnalyzeMode int

const (
	AnalyzeModeSummary AnalyzeMode = iota
	AnalyzeModeArchitect
	AnalyzeModeRefactor
	AnalyzeModeSecurity
	AnalyzeModePerformance
	AnalyzeModeReview  // 自然言語レビューモード
)

// Config は分析の設定
type Config struct {
	APIKey         string
	Mode           AnalyzeMode
	Query          string
	Paths          []string
	Verbosity      int
	Fix            bool
	IncludePattern string
	ExcludePattern string
	UsePro         bool
	OutputFile     string
	Concurrency    int    // 並列実行数
	ReviewPrompt   string // レビュー用のカスタムプロンプト
}

// FileInfo はスキャンされたファイルの情報
type FileInfo struct {
	Path     string
	Content  string
	Language string
	Size     int64
}

// AnalysisResult は分析結果
type AnalysisResult struct {
	Summary      string
	Files        []FileAnalysis
	Issues       []Issue
	Suggestions  []Suggestion
	Reviews      []Review  // レビュー結果
}

// Review は自然言語レビューの結果
type Review struct {
	File        string
	Content     string  // レビュー内容
	Severity    string  // 重要度
	Category    string  // カテゴリ（セキュリティ、パフォーマンス等）
}

// FileAnalysis は個別ファイルの分析結果
type FileAnalysis struct {
	Path        string
	Summary     string
	Issues      []Issue
	Suggestions []Suggestion
}

// Issue は発見された問題
type Issue struct {
	Severity    string // critical, high, medium, low
	Type        string // bug, security, performance, style
	File        string
	Line        int
	Description string
	Fix         string // 修正案
}

// Suggestion は改善提案
type Suggestion struct {
	Type        string // refactor, optimize, modernize
	File        string
	Description string
	Code        string // 提案コード
}