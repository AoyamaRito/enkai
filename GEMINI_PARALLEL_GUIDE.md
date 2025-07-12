# 🚀 Gemini Parallel - AI並列コード生成ツール完全ガイド

Gemini 2.0 Flashを使用して複数のコンポーネントを並列で自動生成する高速開発ツールです。

## 📋 概要

### 特徴
- **高速並列実行**: 複数ファイルを同時生成（デフォルト5並列）
- **AI-First原則**: 1ファイル完結型の実装を自動適用
- **柔軟な実行方法**: プリセット、テンプレート、カスタムタスク対応
- **詳細レポート**: 実行結果をJSONで保存
- **エラーハンドリング**: 失敗しても他のタスクは継続実行

## 🎯 人間向けクイックスタート（5分）

### 1. APIキー取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. 「Create API Key」をクリック
3. キーをコピー

### 2. 環境設定
```bash
# ターミナルで実行
export GEMINI_API_KEY="コピーしたAPIキー"
```

### 3. 実行するだけ
```bash
# Webアプリ作成
npx tsx gemini-parallel.ts create-web-app

# ゲームコンポーネント作成
npx tsx gemini-parallel.ts create-game-components

# 高速化（並列数を増やす）
npx tsx gemini-parallel.ts create-web-app -c 20
```

## 💻 開発者向け詳細ガイド

### インストール

#### 既存プロジェクトに追加
```bash
# 必要なファイルをコピー
cp /path/to/gemini-parallel.ts ./tools/
mkdir -p templates
cp /path/to/templates/*.json ./templates/

# 依存関係インストール
npm install --save-dev @google/generative-ai commander chalk ora p-limit tsx

# package.jsonにスクリプト追加（オプション）
npm pkg set scripts.gen="tsx tools/gemini-parallel.ts"
```

#### 新規プロジェクトとして
```bash
# プロジェクト作成
mkdir gemini-code-generator
cd gemini-code-generator
npm init -y

# 依存関係インストール
npm install @google/generative-ai@0.21.0 commander@12.1.0 chalk@5.4.1 ora@8.2.0 p-limit@5.0.0 tsx

# TypeScript設定
npm install --save-dev typescript @types/node
npx tsc --init
```

### 使用方法

#### テンプレートファイルから実行
```bash
# templatesディレクトリのテンプレートを使用
npx tsx gemini-parallel.ts from-template example

# カスタムテンプレートを使用
npx tsx gemini-parallel.ts from-template todo-app-tasks

# 並列数を指定
npx tsx gemini-parallel.ts from-template tasks -c 10
```

#### プログラマブルな使用方法
```typescript
import { executeGeminiTasks } from './gemini-execute';

// APIキーを設定
process.env.GEMINI_API_KEY = 'your-api-key';

// タスクを定義
const tasks = [
  {
    fileName: 'Header.tsx',
    outputPath: './components/Header.tsx',
    prompt: 'ヘッダーコンポーネント: ロゴ、ナビゲーション、モバイルメニュー'
  },
  {
    fileName: 'Footer.tsx',
    outputPath: './components/Footer.tsx',
    prompt: 'フッターコンポーネント: コピーライト、リンク集、SNSアイコン'
  }
];

// 実行
await executeGeminiTasks(tasks, {
  concurrency: 5,  // 並列実行数
  verbose: true    // 詳細ログ表示
});
```

## 📝 タスクテンプレート形式

### 基本形式
```json
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "コンポーネントの詳細仕様..."
  }
]
```

### 実践的な例

#### UIコンポーネントセット
```json
[
  {
    "fileName": "Button.tsx",
    "outputPath": "./components/ui/Button.tsx",
    "prompt": "ボタンコンポーネント: primary/secondary/danger variants, サイズ対応, ローディング状態"
  },
  {
    "fileName": "Input.tsx",
    "outputPath": "./components/ui/Input.tsx",
    "prompt": "入力フィールド: バリデーション表示, エラー状態, ラベル付き"
  },
  {
    "fileName": "Select.tsx",
    "outputPath": "./components/ui/Select.tsx",
    "prompt": "セレクトボックス: 検索機能, 複数選択対応, カスタムスタイル"
  }
]
```

#### API関連ファイル
```json
[
  {
    "fileName": "users/route.ts",
    "outputPath": "./src/app/api/users/route.ts",
    "prompt": "ユーザーCRUD API: GET/POST/PUT/DELETE, バリデーション, エラーハンドリング"
  },
  {
    "fileName": "auth/route.ts",
    "outputPath": "./src/app/api/auth/route.ts",
    "prompt": "認証API: ログイン/ログアウト, JWT発行, リフレッシュトークン"
  }
]
```

## 🔥 実行例と結果

### コマンド実行
```bash
$ npx tsx gemini-parallel.ts from-template dashboard -c 5

🚀 5個のタスクを並列実行中（並列数: 5）...

✓ DashboardHeader.tsx 完了 (2341ms)
✓ DashboardStats.tsx 完了 (2856ms)
✓ DashboardChart.tsx 完了 (3122ms)
✓ DashboardTable.tsx 完了 (3455ms)
✓ DashboardFilters.tsx 完了 (3892ms)

📊 実行結果:
  成功: 5ファイル
  総実行時間: 3892ms
  平均実行時間: 778ms/ファイル
```

### 生成されるコード例
```typescript
// components/GameChat.tsx
export function GameChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // API通信（このファイル内で完結）
  const sendMessage = async (text: string) => {
    // 実装...
  };
  
  // UI（このファイル内で完結）
  return (
    <div className="game-chat">
      {/* 実装... */}
    </div>
  );
}
```

### 実行レポート
`gemini-report-[timestamp].json`として保存：
```json
{
  "timestamp": "2025-01-10T12:34:56.789Z",
  "totalDuration": 8542,
  "totalTasks": 5,
  "successCount": 5,
  "failCount": 0,
  "averageDuration": 1708,
  "tasks": [
    {
      "fileName": "GameChat.tsx",
      "outputPath": "./components/GameChat.tsx",
      "success": true,
      "duration": 1523
    }
  ]
}
```

## 🚀 実用例

### ECサイト一式を5秒で生成
```bash
npx tsx gemini-parallel.ts from-template e-commerce -c 20
```

### ダッシュボード一式を生成
```bash
npx tsx gemini-parallel.ts from-template dashboard-components -c 20
```

### テストファイル一括生成
```bash
# 既存コンポーネントのテストを一括作成
npx tsx gemini-parallel.ts from-template tests -c 10
```

## 🔧 トラブルシューティング

### APIキーエラー
```bash
エラー: GEMINI_API_KEY環境変数が設定されていません
```
→ 環境変数 `GEMINI_API_KEY` を設定してください

### テンプレート読み込みエラー
```bash
テンプレート読み込みエラー: ./templates/xxx.json
```
→ `templates/`ディレクトリを作成し、テンプレートファイルを配置してください

### 並列実行数の調整
生成が遅い場合は並列数を増やしてください：
```bash
npx tsx gemini-parallel.ts create-game-components -c 20
```

## 💡 ベストプラクティス

1. **タスクファイルをGit管理**: 再利用可能にする
2. **プロンプトは具体的に**: 期待する出力を明確に記述
3. **小さく始める**: まず1-2個のファイルで試す
4. **生成後はレビュー**: AIの出力を必ず確認
5. **繰り返し改善**: プロンプトを調整して品質向上

## ⚙️ 高度な使用方法

### カスタムプロンプトベースの追加
```typescript
const CUSTOM_BASE_PROMPT = `
# カスタム開発原則
独自のルールをここに記載...
`;

// タスクにカスタムプロンプトを組み込む
const task = {
  fileName: 'CustomComponent.tsx',
  outputPath: './components/CustomComponent.tsx',
  prompt: `${CUSTOM_BASE_PROMPT}\n\n具体的な実装内容...`
};
```

### エラーハンドリング
```bash
# 実行結果の確認
cat gemini-report-*.json | jq '.tasks[] | select(.success == false)'

# 失敗したタスクのみ再実行
npx tsx gemini-parallel.ts from-template failed-tasks
```

## 🚨 注意事項

- **APIキーは他人に教えない**
- **生成されたコードは必ず確認**（AIなので稀にエラーあり）
- **大量生成時はAPI利用料金に注意**（月$0-5程度）
- **並列数は適切に設定**（多すぎるとAPI制限に引っかかる）

## それだけ！

人間がやることは：
1. APIキー設定
2. コマンド実行
3. 生成されたコードを使う

このツールを使用することで、開発速度を10倍以上に向上させることができます。