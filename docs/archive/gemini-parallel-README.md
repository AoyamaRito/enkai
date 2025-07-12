# Gemini Parallel - AI並列コード生成ツール

Gemini APIを使用して複数のコンポーネントを並列で自動生成する高速開発ツールです。AI-First開発原則に基づき、完全自己完結型のコードを生成します。

## 特徴

- **並列実行**: 複数ファイルを同時生成（デフォルト5並列）
- **AI-First原則**: 1ファイル完結型の実装を自動適用
- **柔軟な実行方法**: プリセット、テンプレート、カスタムタスク対応
- **詳細レポート**: 実行結果をJSONで保存
- **エラーハンドリング**: 失敗しても他のタスクは継続実行

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/gemini-parallel.git
cd gemini-parallel

# 依存関係のインストール
npm install
```

### 必要な依存関係

```json
{
  "@google/generative-ai": "^0.21.0",
  "commander": "^12.1.0",
  "chalk": "^5.4.1",
  "ora": "^8.2.0",
  "p-limit": "^5.0.0",
  "tsx": "^4.x.x"
}
```

## 使用方法

### 1. APIキーの設定（必須）

```bash
# 環境変数として設定
export GEMINI_API_KEY="your-gemini-api-key"

# または .env ファイルに記載
echo 'GEMINI_API_KEY="your-gemini-api-key"' >> .env
```

### 2. 基本的な使い方

#### プリセットコマンドの実行

```bash
# ゲームコンポーネント5つを生成
npx tsx gemini-parallel.ts create-game-components

# Webアプリコンポーネント3つを生成
npx tsx gemini-parallel.ts create-web-app

# 並列数を指定（デフォルト: 5）
npx tsx gemini-parallel.ts create-game-components -c 10
```

#### テンプレートファイルから実行

```bash
# templatesディレクトリのテンプレートを使用
npx tsx gemini-parallel.ts from-template example

# カスタムテンプレートを使用
npx tsx gemini-parallel.ts from-template todo-app-tasks
```

### 3. テンプレートファイルの作成

`templates/`ディレクトリに`.json`ファイルを作成：

```json
[
  {
    "fileName": "UserProfile.tsx",
    "outputPath": "./components/UserProfile.tsx",
    "prompt": "ユーザープロフィール表示コンポーネント\n- アバター画像\n- 名前、メールアドレス\n- 編集ボタン\n- モバイル対応"
  },
  {
    "fileName": "api/users/route.ts",
    "outputPath": "./app/api/users/route.ts",
    "prompt": "ユーザー情報を取得・更新するAPIエンドポイント\n- GET: ユーザー情報取得\n- PUT: ユーザー情報更新\n- バリデーション実装"
  }
]
```

### 4. プログラマブルな使用方法

Node.jsスクリプト内から直接実行：

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
await executeGeminiTasks(tasks);
```

## 出力例

### 生成されるコード

AI-First原則に基づいた完全自己完結型のコンポーネント：

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

## AI-First開発原則

生成されるコードは以下の原則に従います：

1. **完全自己完結**: 1ファイル = 1つの完全な機能
2. **最小限の外部依存**: React/Next.js標準のみ
3. **ファイル内状態管理**: useState/useReducer使用
4. **直接実装**: カスタムhooks、共有utils禁止
5. **インラインスタイル + Tailwind CSS**

## 高度な使用方法

### カスタムプロンプトベースの追加

独自のベースプロンプトを追加する場合：

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

## トラブルシューティング

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

## ライセンス

MIT License

## 貢献

プルリクエスト歓迎です。大きな変更の場合は、まずissueを作成して変更内容を説明してください。