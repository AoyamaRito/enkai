package cmd

import (
	"fmt"

	"github.com/AoyamaRito/enkai/internal/templates"
	"github.com/spf13/cobra"
)

func newListCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "list",
		Short: "利用可能なプリセットテンプレート一覧を表示",
		RunE: func(cmd *cobra.Command, args []string) error {
			fmt.Println("📋 利用可能なプリセットテンプレート:\n")
			
			presets := templates.ListPresets()
			for _, preset := range presets {
				fmt.Printf("  • %s\n", preset)
			}
			
			fmt.Println("\n使用例:")
			fmt.Println("  enkai from-template game-components")
			fmt.Println("  enkai from-template web-app")
			
			return nil
		},
	}
}