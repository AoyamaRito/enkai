package gemini

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/AoyamaRito/enkai/internal/types"
)

const (
	timeout = 120 * time.Second
)

// 利用可能なGeminiモデル（同じモデルを異なる設定で実行）
var AvailableModels = []string{
	"gemini-2.0-flash",        // 通常モード
	"gemini-2.0-flash",        // Strictモード
	"gemini-2.0-flash",        // クリエイティブモード
}

// モード設定
type GenerationMode int

const (
	ModeNormal GenerationMode = iota
	ModeStrict
	ModeCreative
)

// Client はGemini APIクライアント
type Client struct {
	apiKey     string
	model      string
	mode       GenerationMode
	httpClient *http.Client
}

// NewClient は新しいGeminiクライアントを作成
func NewClient(apiKey string, model string) *Client {
	if model == "" {
		model = "gemini-2.0-flash"
	}
	return &Client{
		apiKey: apiKey,
		model:  model,
		mode:   ModeNormal,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// NewClientWithMode はモード指定でクライアントを作成
func NewClientWithMode(apiKey string, mode GenerationMode) *Client {
	return &Client{
		apiKey: apiKey,
		model:  "gemini-2.0-flash",
		mode:   mode,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// NewProClientWithMode はProモデルでモード指定のクライアントを作成
func NewProClientWithMode(apiKey string, mode GenerationMode) *Client {
	return &Client{
		apiKey: apiKey,
		model:  "gemini-2.0-pro",
		mode:   mode,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// GenerateContent はプロンプトからコンテンツを生成
func (c *Client) GenerateContent(prompt string) (string, error) {
	// AI-First開発原則を含むシステムプロンプト
	systemPrompt := `あなたはAI-First開発原則に従うエキスパートプログラマーです。
以下の原則に必ず従ってコードを生成してください：

1. 完全自己完結: 1ファイル = 1つの完全な機能
2. 外部依存最小限: React/Next.js標準のみ使用
3. 重複コード歓迎: 各ファイルが独立して理解可能
4. ファイル内で全て完結: useState/useReducer使用、カスタムhooks禁止
5. TypeScript使用、日本語対応

生成するコードのみを出力し、説明は不要です。`

	fullPrompt := systemPrompt + "\n\n" + prompt

	// モードに応じた生成設定
	var genConfig *types.GenerationConfig
	switch c.mode {
	case ModeStrict:
		genConfig = &types.GenerationConfig{
			Temperature: 0.2,
			TopP:        0.8,
			TopK:        40,
		}
	case ModeCreative:
		genConfig = &types.GenerationConfig{
			Temperature: 0.9,
			TopP:        0.95,
			TopK:        100,
		}
	default: // ModeNormal
		genConfig = &types.GenerationConfig{
			Temperature: 0.5,
			TopP:        0.9,
			TopK:        60,
		}
	}

	// リクエストボディを作成
	reqBody := types.GeminiRequest{
		Contents: []types.Content{
			{
				Parts: []types.Part{
					{Text: fullPrompt},
				},
			},
		},
		GenerationConfig: genConfig,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("リクエストのJSON化に失敗: %w", err)
	}

	// APIエンドポイント構築
	apiEndpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", c.model)
	
	// HTTPリクエスト作成
	req, err := http.NewRequest("POST", apiEndpoint+"?key="+c.apiKey, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("HTTPリクエストの作成に失敗: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// リクエスト実行
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("APIリクエストに失敗: %w", err)
	}
	defer resp.Body.Close()

	// レスポンス読み取り
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("レスポンスの読み取りに失敗: %w", err)
	}

	// エラーチェック
	if resp.StatusCode != http.StatusOK {
		var errorResp types.GeminiResponse
		if err := json.Unmarshal(body, &errorResp); err == nil && errorResp.Error != nil {
			return "", fmt.Errorf("API エラー: %s (code: %d)", errorResp.Error.Message, errorResp.Error.Code)
		}
		return "", fmt.Errorf("APIエラー: ステータスコード %d", resp.StatusCode)
	}

	// レスポンスパース
	var geminiResp types.GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return "", fmt.Errorf("レスポンスのパースに失敗: %w", err)
	}

	// コンテンツ抽出
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("生成結果が空です")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}