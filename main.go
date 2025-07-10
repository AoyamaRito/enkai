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
)

var rootCmd = &cobra.Command{
	Use:   "enkai",
	Short: "🔥 Enkai - Gemini並列実行ツール",
	Long: `Enkaiは、AI-First開発を加速するGemini API並列実行ツールです。
複数のタスクを同時に処理し、開発速度を10-15倍に向上させます。`,
}

func init() {
	rootCmd.PersistentFlags().IntVarP(&concurrency, "concurrency", "c", 5, "並列実行数")
	rootCmd.PersistentFlags().StringVar(&apiKey, "api-key", "", "Gemini API Key (環境変数 GEMINI_API_KEY でも設定可)")
	rootCmd.PersistentFlags().BoolVar(&noCompete, "no-compete", false, "コンペティションモードを無効化（デフォルト: false）")
	rootCmd.PersistentFlags().StringSliceVar(&models, "models", nil, "使用するモデル（デフォルト: 全モデル）")
	
	// サブコマンドを追加
	rootCmd.AddCommand(cmd.NewFromTemplateCmd())
	rootCmd.AddCommand(cmd.NewFromJSONCmd())
	rootCmd.AddCommand(cmd.NewListCmd())
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}