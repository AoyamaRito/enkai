# 🔥 Enkai - Gemini並列実行ツール

AI-First開発を加速する、Gemini APIを使った並列タスク実行システム。

## 概要

Enkaiは、複数のAIタスクを並列実行することで、開発速度を10-15倍に向上させるツールです。各タスクは独立したGemini APIインスタンスで処理され、完全自己完結型のコードを生成します。

## 特徴

- **並列実行**: 最大5つのタスクを同時実行（調整可能）
- **AI-First原則**: 1ファイル読むだけで全て理解可能なコード生成
- **完全自己完結**: 外部依存を最小限に抑えた実装
- **簡単な使用方法**: CLIまたはWebインターフェースから利用可能

## クイックスタート

### 1. 環境設定

```bash
# APIキーの設定
export GEMINI_API_KEY="your-api-key"

# またはapi-key-managerを使用
npm run akm shell my-gemini | grep export
```

### 2. CLIから実行

```bash
# JSONファイルから実行
npx tsx gemini-parallel.ts from-template tasks/my-task.json

# プリセットテンプレートを使用
npx tsx gemini-parallel.ts create-game-components

# 並列数を指定（デフォルト: 5）
npx tsx gemini-parallel.ts from-template tasks/my-task.json -c 10
```

### 3. Webインターフェースから実行

```bash
npm run dev
# http://localhost:3000 にアクセス
```

## タスクJSON形式

```json
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "AI-First原則に従い、完全自己完結のコンポーネントを実装"
  }
]
```

## AI-First開発原則

1. **完全自己完結**: 1ファイル = 1つの完全な機能
2. **外部依存最小限**: React/Next.js標準のみ使用
3. **重複コード歓迎**: 各ファイルが独立して理解可能
4. **即座修正可能**: 「このファイルの〇〇を変更」で完結

## ディレクトリ構造

```
enkai/
├── gemini-parallel.ts      # 並列実行エンジン
├── api-key-manager.ts      # APIキー管理ツール
├── app/                    # Next.js Webインターフェース
├── templates/              # タスクテンプレート
├── tasks/                  # タスクJSON格納場所
└── CLAUDE.md              # AI-First開発原則詳細
```

## 開発

```bash
# インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run typecheck

# リント
npm run lint
```

## 注意事項

- APIキーは環境変数で管理してください
- 並列実行数を増やしすぎるとレート制限に引っかかる可能性があります
- 生成されたコードは必ずレビューしてください

## ライセンス

MIT