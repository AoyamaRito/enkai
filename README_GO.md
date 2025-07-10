# 🔥 Enkai (Go版) - Gemini並列実行CLIツール

純粋なCLIツールとして、Go言語で再実装されたEnkaiです。
**デフォルトでコンペティションモード**：複数のGeminiモデルで同時実行し、最良の結果を自動選択します。

## 特徴

- **コンペティションモード（デフォルト）**: 複数モデルで競争実行、最良の結果を自動選択
- **単一バイナリ**: `enkai`コマンド一つで動作
- **高速並列実行**: Goのgoroutineで効率的な並列処理
- **クロスプラットフォーム**: Windows/Mac/Linux対応
- **依存関係ゼロ**: npm install不要、即実行可能

## インストール

### バイナリダウンロード（推奨）
```bash
# macOS/Linux
curl -L https://github.com/AoyamaRito/enkai/releases/latest/download/enkai-$(uname -s)-$(uname -m) -o enkai
chmod +x enkai
sudo mv enkai /usr/local/bin/

# または go install
go install github.com/AoyamaRito/enkai@latest
```

### ソースからビルド
```bash
git clone https://github.com/AoyamaRito/enkai
cd enkai
go build -o enkai
```

## 使用方法

### 1. APIキー設定
```bash
export GEMINI_API_KEY="your-api-key"
```

### 2. 実行例

#### コンペティションモード（デフォルト）
```bash
# 3つのモデルで競争実行、最良の結果を採用
enkai from-template game-components

# 特定のモデルのみ使用
enkai from-template web-app --models gemini-1.5-flash-latest,gemini-1.5-pro-latest

# 並列数を増やして高速化
enkai from-template game-components -c 10
```

#### 通常モード（単一モデル）
```bash
# コンペティションを無効化
enkai from-template game-components --no-compete
```

#### JSONファイルから実行
```bash
# tasks.jsonから実行
enkai from-template tasks.json

# JSON文字列を直接指定
enkai from-json '[{"fileName":"App.tsx","outputPath":"./App.tsx","prompt":"シンプルなTodoアプリ"}]'
```

#### プリセット一覧表示
```bash
enkai list
```

## タスクJSON形式
```json
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "完全自己完結のReactコンポーネントを実装"
  }
]
```

## オプション

- `-c, --concurrency`: 並列実行数（デフォルト: 5）
- `--api-key`: Gemini APIキー（環境変数より優先）
- `--no-compete`: コンペティションモードを無効化（デフォルト: false）
- `--models`: 使用するモデルをカンマ区切りで指定（デフォルト: 全モデル）

## コンペティションモードについて

デフォルトで有効なコンペティションモードでは：

1. **複数モデルで同時実行**: 各タスクを3つのGeminiモデルで並列実行
2. **自動評価**: コード品質、実行時間、AI-First原則準拠度を自動評価
3. **最良結果の選択**: スコアリングにより最適な結果を自動選択
4. **透明性**: どのモデルが選ばれたか、なぜ選ばれたかを表示

利用可能なモデル：
- `gemini-1.5-flash-latest`（高速）
- `gemini-1.5-pro-latest`（高品質）
- `gemini-1.0-pro`（安定版）

## プリセットテンプレート

### game-components
- GameChat.tsx: リアルタイムチャット
- PlayerProfile.tsx: プレイヤープロファイル
- BattleSystem.tsx: バトルシステム

### web-app
- Dashboard.tsx: 管理ダッシュボード
- UserSettings.tsx: ユーザー設定
- NotificationCenter.tsx: 通知センター

## 開発

```bash
# 依存関係インストール
go mod download

# ビルド
go build -o enkai

# テスト
go test ./...

# クロスコンパイル
GOOS=windows GOARCH=amd64 go build -o enkai.exe
GOOS=linux GOARCH=amd64 go build -o enkai-linux
```

## アーキテクチャ

```
enkai/
├── main.go              # エントリーポイント
├── cmd/                 # CLIコマンド
├── internal/
│   ├── executor/        # 並列実行エンジン
│   ├── gemini/          # Gemini APIクライアント
│   ├── templates/       # プリセットテンプレート
│   └── types/           # 型定義
└── go.mod
```

## ライセンス

MIT