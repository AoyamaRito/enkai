package types

import "time"

// Task はGeminiに実行させるタスクを表す
type Task struct {
	FileName   string `json:"fileName"`
	OutputPath string `json:"outputPath"`
	Prompt     string `json:"prompt"`
}

// ExecutionResult はタスク実行結果を表す
type ExecutionResult struct {
	Task    Task
	Content string
	Error   error
}

// CompetitionResult は複数モデルの実行結果を表す
type CompetitionResult struct {
	Task        Task
	Results     []ModelResult
	BestResult  *ModelResult
	SelectionReason string
}

// ModelResult は各モデルの実行結果
type ModelResult struct {
	Model    string
	Content  string
	Error    error
	Score    float64 // 評価スコア
	Duration time.Duration
}

// GeminiRequest はGemini APIへのリクエスト
type GeminiRequest struct {
	Contents             []Content             `json:"contents"`
	GenerationConfig     *GenerationConfig     `json:"generationConfig,omitempty"`
}

// Content はメッセージコンテンツ
type Content struct {
	Parts []Part `json:"parts"`
}

// Part はメッセージの一部
type Part struct {
	Text string `json:"text"`
}

// GeminiResponse はGemini APIからのレスポンス
type GeminiResponse struct {
	Candidates []Candidate `json:"candidates"`
	Error      *APIError   `json:"error,omitempty"`
}

// Candidate は生成候補
type Candidate struct {
	Content Content `json:"content"`
}

// APIError はAPIエラー
type APIError struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// GenerationConfig は生成設定
type GenerationConfig struct {
	Temperature      float64 `json:"temperature,omitempty"`
	TopP             float64 `json:"topP,omitempty"`
	TopK             int     `json:"topK,omitempty"`
	MaxOutputTokens  int     `json:"maxOutputTokens,omitempty"`
}