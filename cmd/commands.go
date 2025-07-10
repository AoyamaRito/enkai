package cmd

import (
	"os"

	"github.com/spf13/cobra"
)


// NewFromTemplateCmd はfrom-templateサブコマンドを作成
func NewFromTemplateCmd() *cobra.Command {
	cmd := newFromTemplateCmd()
	return cmd
}

// NewFromJSONCmd はfrom-jsonサブコマンドを作成
func NewFromJSONCmd() *cobra.Command {
	cmd := newFromJSONCmd()
	return cmd
}

// NewListCmd はlistサブコマンドを作成
func NewListCmd() *cobra.Command {
	cmd := newListCmd()
	return cmd
}

func getAPIKey() string {
	// グローバル変数から取得する方法を後で実装
	return os.Getenv("GEMINI_API_KEY")
}

func getConcurrency(cmd *cobra.Command) int {
	// 親コマンドから継承された値を取得
	c, _ := cmd.Root().PersistentFlags().GetInt("concurrency")
	if c <= 0 {
		return 5
	}
	return c
}

func isCompetitionMode(cmd *cobra.Command) bool {
	// デフォルトはコンペティションモード有効
	noCompete, _ := cmd.Root().PersistentFlags().GetBool("no-compete")
	return !noCompete
}

func getModels(cmd *cobra.Command) []string {
	models, _ := cmd.Root().PersistentFlags().GetStringSlice("models")
	return models
}

func isProMode(cmd *cobra.Command) bool {
	pro, _ := cmd.Root().PersistentFlags().GetBool("pro")
	return pro
}