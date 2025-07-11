package main

import (
	"fmt"
	"os"
)

// ビルド時にldフラグで埋め込まれる変数
var (
	geminiAPIKey = "NOT_SET"
	buildTime    = "NOT_SET"
	version      = "1.0.0"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("使用方法:")
		fmt.Println("  apikey-holder show    - APIキーを表示")
		fmt.Println("  apikey-holder export  - export文を出力")
		fmt.Println("  apikey-holder version - バージョン情報を表示")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "show":
		if geminiAPIKey == "NOT_SET" {
			fmt.Println("エラー: APIキーが設定されていません")
			fmt.Println("ビルド時に -ldflags でAPIキーを指定してください")
			os.Exit(1)
		}
		fmt.Println(geminiAPIKey)
		
	case "export":
		if geminiAPIKey == "NOT_SET" {
			fmt.Println("# エラー: APIキーが設定されていません")
			os.Exit(1)
		}
		fmt.Printf("export GEMINI_API_KEY=\"%s\"\n", geminiAPIKey)
		
	case "version":
		fmt.Printf("Version: %s\n", version)
		fmt.Printf("Build Time: %s\n", buildTime)
		fmt.Printf("API Key Status: %s\n", func() string {
			if geminiAPIKey == "NOT_SET" {
				return "未設定"
			}
			return "設定済み"
		}())
		
	default:
		fmt.Printf("不明なコマンド: %s\n", os.Args[1])
		os.Exit(1)
	}
}