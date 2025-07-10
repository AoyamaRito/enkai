package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
)

// ビルド時に埋め込まれるAPIキー
var (
	geminiAPIKey = ""
	buildTime    = "NOT_SET"
	version      = "1.0.0"
)

// 設定ファイルの構造
type Config struct {
	GeminiAPIKey string `json:"gemini_api_key,omitempty"`
}

// 設定ファイルのパスを取得
func getConfigPath() string {
	homeDir, _ := os.UserHomeDir()
	return filepath.Join(homeDir, ".enkai", "config.json")
}

func main() {
	if len(os.Args) < 2 {
		showHelp()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "api":
		handleAPICommand()
	case "gemini":
		runGeminiCommand()
	case "help", "-h", "--help":
		showHelp()
	case "version", "-v", "--version":
		showVersion()
	default:
		// --helpオプションのチェック
		for _, arg := range os.Args[1:] {
			if arg == "--help" || arg == "-h" {
				showHelp()
				return
			}
			if arg == "--version" || arg == "-v" {
				showVersion()
				return
			}
		}
		fmt.Printf("不明なコマンド: %s\n", os.Args[1])
		showHelp()
		os.Exit(1)
	}
}

func handleAPICommand() {
	if len(os.Args) < 3 {
		fmt.Println("使用方法:")
		fmt.Println("  enkai api set <API_KEY>  - APIキーを設定")
		fmt.Println("  enkai api delete         - APIキーを削除")
		fmt.Println("  enkai api status         - APIキーの状態を確認")
		os.Exit(1)
	}

	switch os.Args[2] {
	case "set":
		if len(os.Args) < 4 {
			fmt.Println("エラー: APIキーを指定してください")
			fmt.Println("使用方法: enkai api set <API_KEY>")
			os.Exit(1)
		}
		setAPIKey(os.Args[3])
		
	case "delete":
		deleteAPIKey()
		
	case "status":
		showAPIStatus()
		
	default:
		fmt.Printf("不明なサブコマンド: %s\n", os.Args[2])
		os.Exit(1)
	}
}

func setAPIKey(apiKey string) {
	config := Config{GeminiAPIKey: apiKey}
	
	// 設定ディレクトリを作成
	configPath := getConfigPath()
	configDir := filepath.Dir(configPath)
	if err := os.MkdirAll(configDir, 0700); err != nil {
		fmt.Printf("エラー: 設定ディレクトリの作成に失敗しました: %v\n", err)
		os.Exit(1)
	}
	
	// 設定を保存
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		fmt.Printf("エラー: 設定の保存に失敗しました: %v\n", err)
		os.Exit(1)
	}
	
	if err := ioutil.WriteFile(configPath, data, 0600); err != nil {
		fmt.Printf("エラー: 設定ファイルの書き込みに失敗しました: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Println("APIキーを設定しました")
}

func deleteAPIKey() {
	configPath := getConfigPath()
	
	// ファイルが存在しない場合は何もしない
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		fmt.Println("APIキーは設定されていません")
		return
	}
	
	// 設定ファイルを削除
	if err := os.Remove(configPath); err != nil {
		fmt.Printf("エラー: 設定ファイルの削除に失敗しました: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Println("APIキーを削除しました")
}

func showAPIStatus() {
	// 優先順位: 設定ファイル > ビルド時埋め込み > 環境変数
	if config := loadConfig(); config != nil && config.GeminiAPIKey != "" {
		fmt.Println("APIキー状態: 設定ファイルに保存済み")
		fmt.Printf("APIキー: %s...%s\n", config.GeminiAPIKey[:10], config.GeminiAPIKey[len(config.GeminiAPIKey)-4:])
	} else if geminiAPIKey != "" {
		fmt.Println("APIキー状態: ビルド時に埋め込み済み")
		fmt.Printf("APIキー: %s...%s\n", geminiAPIKey[:10], geminiAPIKey[len(geminiAPIKey)-4:])
	} else if apiKey := os.Getenv("GEMINI_API_KEY"); apiKey != "" {
		fmt.Println("APIキー状態: 環境変数から取得可能")
		fmt.Printf("APIキー: %s...%s\n", apiKey[:10], apiKey[len(apiKey)-4:])
	} else {
		fmt.Println("APIキー状態: 未設定")
	}
}

func loadConfig() *Config {
	configPath := getConfigPath()
	
	data, err := ioutil.ReadFile(configPath)
	if err != nil {
		return nil
	}
	
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil
	}
	
	return &config
}

func runGeminiCommand() {
	// APIキーを自動的に環境変数に設定
	apiKey := getAPIKey()
	if apiKey == "" {
		fmt.Println("エラー: Gemini APIキーが設定されていません")
		fmt.Println("以下のいずれかの方法で設定してください:")
		fmt.Println("1. enkai api set <API_KEY>")
		fmt.Println("2. 環境変数: export GEMINI_API_KEY=<API_KEY>")
		os.Exit(1)
	}

	// gemini-parallel.tsの検索パス
	homeDir, _ := os.UserHomeDir()
	searchPaths := []string{
		"./gemini-parallel.ts",                           // カレントディレクトリ
		filepath.Join(homeDir, "enkai/gemini-parallel.ts"), // ~/enkai/
		filepath.Join(homeDir, "romeo3/enkai/gemini-parallel.ts"), // ~/romeo3/enkai/
	}

	var geminiPath string
	for _, path := range searchPaths {
		if _, err := os.Stat(path); err == nil {
			geminiPath = path
			break
		}
	}

	if geminiPath == "" {
		fmt.Println("エラー: gemini-parallel.tsが見つかりません")
		fmt.Println("以下のいずれかの場所にgemini-parallel.tsを配置してください:")
		for _, path := range searchPaths {
			fmt.Printf("  - %s\n", path)
		}
		os.Exit(1)
	}

	// npxとtsxの存在確認
	if _, err := exec.LookPath("npx"); err != nil {
		fmt.Println("エラー: npxコマンドが見つかりません")
		fmt.Println("Node.jsとnpmをインストールしてください")
		os.Exit(1)
	}

	// コマンドライン引数を構築
	args := []string{"tsx", geminiPath}
	if len(os.Args) > 2 {
		args = append(args, os.Args[2:]...)
	}

	// コマンドを実行
	cmd := exec.Command("npx", args...)
	cmd.Env = append(os.Environ(), fmt.Sprintf("GEMINI_API_KEY=%s", apiKey))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	if err := cmd.Run(); err != nil {
		fmt.Printf("エラー: %v\n", err)
		os.Exit(1)
	}
}

func getAPIKey() string {
	// 優先順位: 設定ファイル > ビルド時埋め込み > 環境変数
	if config := loadConfig(); config != nil && config.GeminiAPIKey != "" {
		return config.GeminiAPIKey
	}
	if geminiAPIKey != "" {
		return geminiAPIKey
	}
	return os.Getenv("GEMINI_API_KEY")
}

func showHelp() {
	fmt.Println("enkai - AI-First開発ツール")
	fmt.Println()
	fmt.Println("使用方法:")
	fmt.Println("  enkai <command> [options]")
	fmt.Println()
	fmt.Println("コマンド:")
	fmt.Println("  api       APIキー管理コマンド")
	fmt.Println("    set <KEY>  - APIキーを設定（~/.enkai/config.jsonに保存）")
	fmt.Println("    delete     - APIキーを削除")
	fmt.Println("    status     - APIキーの状態を確認")
	fmt.Println()
	fmt.Println("  gemini    Gemini並列実行ツールを起動")
	fmt.Println("    from-template <name>      - テンプレートから実行")
	fmt.Println("    create-game-components    - ゲームコンポーネント作成プリセット")
	fmt.Println("    create-web-app           - Webアプリ作成プリセット")
	fmt.Println()
	fmt.Println("  help      このヘルプを表示")
	fmt.Println("  version   バージョン情報を表示")
	fmt.Println()
	fmt.Println("Geminiコマンドオプション:")
	fmt.Println("  -c <数値>           並列実行数（デフォルト: 5）")
	fmt.Println("  --output <ディレクトリ>  出力先ディレクトリを指定")
	fmt.Println("  --dry-run           実行せずにタスクを表示")
	fmt.Println()
	fmt.Println("例:")
	fmt.Println("  enkai api set AIzaSyC...")
	fmt.Println("  enkai gemini from-template dashboard-components -c 3")
	fmt.Println("  enkai gemini from-template todo-app --output ./src/components")
	fmt.Println()
	fmt.Println("テンプレート形式（templates/ディレクトリ内のJSONファイル）:")
	fmt.Println("  [")
	fmt.Println("    {")
	fmt.Println("      \"fileName\": \"Component.tsx\",")
	fmt.Println("      \"outputPath\": \"./components/Component.tsx\",")
	fmt.Println("      \"prompt\": \"コンポーネントの詳細な実装指示\"")
	fmt.Println("    }")
	fmt.Println("  ]")
	fmt.Println()
	fmt.Println("注意: --outputオプションはコマンドライン引数として指定します。")
	fmt.Println("      JSONファイル内のoutputPathは--outputで上書きされません。")
}

func showVersion() {
	fmt.Printf("enkai version %s\n", version)
	fmt.Printf("Build Time: %s\n", buildTime)
	fmt.Printf("API Key: %s\n", func() string {
		if geminiAPIKey != "" {
			return "埋め込み済み"
		} else if os.Getenv("GEMINI_API_KEY") != "" {
			return "環境変数で設定済み"
		}
		return "未設定"
	}())
}