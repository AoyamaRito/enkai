package analyzer

// AnalyzeMode は分析モードの種類
type AnalyzeMode int

const (
	AnalyzeModeSummary AnalyzeMode = iota
	AnalyzeModeArchitect
	AnalyzeModeRefactor
	AnalyzeModeSecurity
	AnalyzeModePerformance
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