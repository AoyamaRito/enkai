# Gemini Parallel - 汎用AI並列実行ツール

Gemini 2.0 Flash APIを使用して、複数のAIタスクを並列実行するCLIツールです。コード生成、データ処理、テキスト変換など、あらゆるAIタスクを高速並列処理できます。

## 特徴

- 🚀 **並列実行**: 複数のAIタスクを同時実行で高速化
- 🎯 **汎用設計**: コード生成、翻訳、分析など何でも可能
- 📊 **詳細レポート**: 実行結果の詳細なJSON形式レポート
- 🎨 **美しいCLI**: カラフルな進捗表示とスピナー
- ⚡ **高速処理**: Gemini 2.0 Flash使用で高速レスポンス
- 🔧 **カスタマイズ可能**: JSONテンプレートで自由にタスク定義

## インストール

```bash
npm install
```

## 環境変数設定

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

## 基本的な使い方

### 1. テンプレートファイルの作成

`tasks.json`を作成:

```json
[
  {
    "fileName": "output1.txt",
    "outputPath": "./results/output1.txt",
    "prompt": "Write a detailed analysis of climate change impacts"
  },
  {
    "fileName": "script.py",
    "outputPath": "./scripts/script.py",
    "prompt": "Create a Python script for data visualization using matplotlib"
  },
  {
    "fileName": "README.md",
    "outputPath": "./docs/README.md",
    "prompt": "Generate comprehensive documentation for a REST API"
  }
]
```

### 2. 実行

```bash
# テンプレートから実行
npx tsx gemini-parallel.ts from-template tasks

# 並列実行数を指定（デフォルト: 5）
npx tsx gemini-parallel.ts from-template tasks -c 10
```

## 実用例

### コード生成（複数言語）
```json
[
  {
    "fileName": "server.js",
    "outputPath": "./backend/server.js",
    "prompt": "Create an Express.js server with JWT authentication"
  },
  {
    "fileName": "app.py",
    "outputPath": "./backend/app.py",
    "prompt": "Create a FastAPI server with JWT authentication"
  },
  {
    "fileName": "main.go",
    "outputPath": "./backend/main.go",
    "prompt": "Create a Gin server with JWT authentication"
  }
]
```

### ドキュメント生成
```json
[
  {
    "fileName": "API.md",
    "outputPath": "./docs/API.md",
    "prompt": "Generate API documentation for an e-commerce platform"
  },
  {
    "fileName": "SETUP.md",
    "outputPath": "./docs/SETUP.md",
    "prompt": "Create a setup guide for developers"
  },
  {
    "fileName": "ARCHITECTURE.md",
    "outputPath": "./docs/ARCHITECTURE.md",
    "prompt": "Write a system architecture document"
  }
]
```

### データ分析スクリプト
```json
[
  {
    "fileName": "analyze_sales.py",
    "outputPath": "./analysis/analyze_sales.py",
    "prompt": "Python script to analyze sales data with pandas and create visualizations"
  },
  {
    "fileName": "customer_segmentation.py",
    "outputPath": "./analysis/customer_segmentation.py",
    "prompt": "Python script for customer segmentation using K-means clustering"
  },
  {
    "fileName": "forecast_revenue.py",
    "outputPath": "./analysis/forecast_revenue.py",
    "prompt": "Python script for revenue forecasting using time series analysis"
  }
]
```

### 翻訳タスク
```json
[
  {
    "fileName": "README_ja.md",
    "outputPath": "./translations/README_ja.md",
    "prompt": "Translate the following to Japanese: [Your English content here]"
  },
  {
    "fileName": "README_es.md",
    "outputPath": "./translations/README_es.md",
    "prompt": "Translate the following to Spanish: [Your English content here]"
  }
]
```

## 高度な使い方

### プロンプトテンプレートの活用

共通のベースプロンプトを使用する場合:

```javascript
const basePrompt = `
言語: TypeScript
フレームワーク: React
スタイル: Tailwind CSS
要件: モバイルファースト、アクセシビリティ対応

タスク: `;

const tasks = [
  {
    fileName: "Header.tsx",
    outputPath: "./components/Header.tsx",
    prompt: basePrompt + "ヘッダーコンポーネントを作成"
  },
  // ...
];
```

### 実行結果

実行後、以下が生成されます:
- 指定されたすべての出力ファイル
- `gemini-report-[timestamp].json` - 詳細な実行レポート

レポート例:
```json
{
  "timestamp": "2024-01-09T10:30:00.000Z",
  "totalDuration": 5234,
  "totalTasks": 10,
  "successCount": 10,
  "failCount": 0,
  "averageDuration": 523,
  "tasks": [...]
}
```

## プリセットコマンド（サンプル）

ツールには2つのサンプルコマンドが含まれています:
- `create-game-components`: ゲーム開発用コンポーネントの例
- `create-web-app`: Webアプリ用コンポーネントの例

これらは参考実装として提供されており、実際の使用では独自のテンプレートを作成することを推奨します。

## Claude Code内での使用方法

### 直接実行（プログラマティック）

```typescript
import { executeGeminiTasks } from './gemini-execute';

// タスク定義
const tasks = [
  {
    fileName: 'Header.tsx',
    outputPath: './components/Header.tsx',
    prompt: 'Create a responsive header component'
  },
  {
    fileName: 'Footer.tsx',
    outputPath: './components/Footer.tsx',
    prompt: 'Create a footer component'
  }
];

// 実行
const results = await executeGeminiTasks(tasks);
```

### AI-First開発用ヘルパー

```typescript
import { executeAIFirstComponents } from './gemini-execute';

const components = [
  {
    name: 'GameChat.tsx',
    spec: 'NPCチャットシステム with リアルタイム更新'
  },
  {
    name: 'PlayerProfile.tsx',
    spec: 'プレイヤープロフィール with ステータス管理'
  }
];

await executeAIFirstComponents(components, './components');
```

### クイック実行

```typescript
import { quickExecute } from './gemini-execute';

await quickExecute([
  { name: 'utils.ts', description: 'Date formatting utilities' },
  { name: 'types.ts', description: 'TypeScript interfaces' }
]);
```

詳細な使用例は `claude-code-example.ts` を参照してください。

## 開発

```bash
# TypeScriptで直接実行
npm run dev from-template my-tasks

# ビルド
npm run build

# ビルド後の実行
npm start from-template my-tasks
```

## ライセンス

MIT