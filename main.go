package main

import (
	"fmt"
	"os"

	"github.com/AoyamaRito/enkai/cmd"
	"github.com/spf13/cobra"
)

var (
	concurrency int
	apiKey      string
	noCompete   bool
	models      []string
	usePro      bool
)

var rootCmd = &cobra.Command{
	Use:   "enkai",
	Short: "🔥 Enkai - Gemini並列実行ツール",
	Long: `Enkaiは、AI-First開発を加速するGemini API並列実行ツールです。
複数のタスクを同時に処理し、開発速度を10-15倍に向上させます。

デフォルト動作:
  - Gemini 2.0-Flashを3つのモード（通常/Strict/クリエイティブ）で実行
  - 各モードの結果を自動評価し、最良のコードを選択

使用例:
  enkai from-template game-components        # Flashモデルで実行
  enkai from-template game-components --pro  # Proモデルで実行（高品質）`,
}

func init() {
	rootCmd.PersistentFlags().IntVarP(&concurrency, "concurrency", "c", 5, "並列実行数")
	rootCmd.PersistentFlags().StringVar(&apiKey, "api-key", "", "Gemini API Key (環境変数 GEMINI_API_KEY でも設定可)")
	rootCmd.PersistentFlags().BoolVar(&noCompete, "no-compete", false, "コンペティションモードを無効化（デフォルト: false）")
	rootCmd.PersistentFlags().StringSliceVar(&models, "models", nil, "使用するモデル（デフォルト: 全モデル）")
	rootCmd.PersistentFlags().BoolVar(&usePro, "pro", false, "Gemini 2.0-Proモデルを使用（通常/Strict/クリエイティブの3モードで競争実行）")
	
	// サブコマンドを追加
	rootCmd.AddCommand(cmd.NewFromTemplateCmd())
	rootCmd.AddCommand(cmd.NewFromJSONCmd())
	rootCmd.AddCommand(cmd.NewListCmd())
	rootCmd.AddCommand(cmd.NewAnalyzeCmd())
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}