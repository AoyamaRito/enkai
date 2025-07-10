package cmd

import (
	"fmt"

	"github.com/AoyamaRito/enkai/internal/analyzer"
	"github.com/spf13/cobra"
)

var (
	analyzeMode    string
	verbosity      int
	fix            bool
	includePattern string
	excludePattern string
)

func newAnalyzeCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "analyze [query] [paths...]",
		Short: "コードベースを分析して理解を支援",
		Long: `コードベースを高速に分析し、アーキテクチャの理解やリファクタリング提案を行います。

使用例:
  enkai analyze                              # プロジェクト全体のサマリー
  enkai analyze --mode architect             # アーキテクチャ分析
  enkai analyze --mode refactor              # リファクタリング候補提案
  enkai analyze "セキュリティホール" src/    # カスタムクエリで分析
  enkai analyze --fix                        # 問題を見つけて即修正`,
		RunE: runAnalyze,
	}

	// フラグ設定
	cmd.Flags().StringVar(&analyzeMode, "mode", "", "分析モード (architect/refactor/security/performance)")
	cmd.Flags().CountVarP(&verbosity, "verbose", "v", "詳細度 (-v: ファイル要約, -vv: 完全分析)")
	cmd.Flags().BoolVar(&fix, "fix", false, "見つかった問題を自動修正")
	cmd.Flags().StringVar(&includePattern, "include", "", "含めるファイルパターン (例: **/*.ts)")
	cmd.Flags().StringVar(&excludePattern, "exclude", "", "除外するファイルパターン")

	return cmd
}

func runAnalyze(cmd *cobra.Command, args []string) error {
	// APIキーの確認
	apiKey := getAPIKey()
	if apiKey == "" {
		return fmt.Errorf("GEMINI_API_KEY環境変数が設定されていません")
	}

	// クエリとパスの解析
	var query string
	var paths []string

	if len(args) > 0 {
		// カスタムクエリが指定された場合
		query = args[0]
		if len(args) > 1 {
			paths = args[1:]
		} else {
			paths = []string{"."}
		}
	} else {
		// デフォルトクエリ
		query = ""
		paths = []string{"."}
	}

	// 分析モードの設定
	mode := analyzer.AnalyzeModeSummary
	if analyzeMode != "" {
		switch analyzeMode {
		case "architect":
			mode = analyzer.AnalyzeModeArchitect
		case "refactor":
			mode = analyzer.AnalyzeModeRefactor
		case "security":
			mode = analyzer.AnalyzeModeSecurity
		case "performance":
			mode = analyzer.AnalyzeModePerformance
		default:
			return fmt.Errorf("無効な分析モード: %s", analyzeMode)
		}
	}

	// 分析の実行
	config := analyzer.Config{
		APIKey:         apiKey,
		Mode:          mode,
		Query:         query,
		Paths:         paths,
		Verbosity:     verbosity,
		Fix:           fix,
		IncludePattern: includePattern,
		ExcludePattern: excludePattern,
		UsePro:        isProMode(cmd),
	}

	analyzer := analyzer.New(config)
	return analyzer.Run()
}