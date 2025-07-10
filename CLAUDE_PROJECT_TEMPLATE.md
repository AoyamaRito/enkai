# Gemini並列実行ツール使用ガイド

このプロジェクトでは、Gemini 2.0 Flashを使用した並列コード生成ツールが利用可能です。
複数のコンポーネントやファイルを同時に生成することで、開発速度を大幅に向上させることができます。

## 🚀 Gemini並列実行ツールの場所

```
~/romeo3/enkai/gemini-parallel.ts
~/romeo3/enkai/gemini-execute.ts
```

## 📋 基本的な使い方

### 1. タスクファイルの作成

まず、生成したいファイルのリストをJSONで定義します：

```json
// tasks/new-feature.json
[
  {
    "fileName": "FeatureComponent.tsx",
    "outputPath": "./src/components/FeatureComponent.tsx",
    "prompt": "機能の詳細な仕様をここに記述..."
  },
  {
    "fileName": "useFeature.ts",
    "outputPath": "./src/hooks/useFeature.ts",
    "prompt": "カスタムフックの仕様..."
  }
]
```

### 2. 実行方法

```bash
# 環境変数設定（初回のみ）
export GEMINI_API_KEY="your-api-key"

# タスクファイルから実行
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tasks/new-feature -c 5
```

### 3. Claude Code内から直接実行

```typescript
import { executeGeminiTasks } from '~/romeo3/enkai/gemini-execute';

const tasks = [
  {
    fileName: 'Component.tsx',
    outputPath: './src/components/Component.tsx',
    prompt: 'コンポーネントの仕様...'
  }
];

await executeGeminiTasks(tasks, {
  concurrency: 5,  // 並列実行数
  verbose: true    // 詳細ログ表示
});
```

## 🎯 プロジェクト固有の使用例

### UIコンポーネント一括生成

```json
[
  {
    "fileName": "Button.tsx",
    "outputPath": "./src/components/ui/Button.tsx",
    "prompt": "ボタンコンポーネント: primary/secondary/danger variants, サイズ対応, ローディング状態"
  },
  {
    "fileName": "Input.tsx",
    "outputPath": "./src/components/ui/Input.tsx",
    "prompt": "入力フィールド: バリデーション表示, エラー状態, ラベル付き"
  },
  {
    "fileName": "Select.tsx",
    "outputPath": "./src/components/ui/Select.tsx",
    "prompt": "セレクトボックス: 検索機能, 複数選択対応, カスタムスタイル"
  }
]
```

### API関連ファイル生成

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

### テストファイル一括生成

```json
[
  {
    "fileName": "Button.test.tsx",
    "outputPath": "./src/components/ui/__tests__/Button.test.tsx",
    "prompt": "Buttonコンポーネントのテスト: 各variant、クリックイベント、disabled状態"
  },
  {
    "fileName": "useApi.test.ts",
    "outputPath": "./src/hooks/__tests__/useApi.test.ts",
    "prompt": "useApiフックのテスト: 成功/失敗ケース、loading状態、エラーハンドリング"
  }
]
```

## 💡 効果的な使い方

### 1. 新機能開発時
```bash
# 機能に必要な全コンポーネントを一度に生成
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tasks/user-dashboard
```

### 2. リファクタリング時
```bash
# 既存コンポーネントを新仕様で再生成
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tasks/refactor-v2
```

### 3. 初期セットアップ時
```bash
# 基本的なUIコンポーネントセットを生成
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tasks/ui-library
```

## ⚙️ カスタマイズ

### 並列実行数の調整
```bash
# 重いタスクの場合は並列数を減らす
-c 2  # 2つまで同時実行

# 軽いタスクの場合は増やす
-c 10  # 10個まで同時実行
```

### プロジェクト固有のベースプロンプト
```typescript
const basePrompt = `
技術スタック:
- React 18
- TypeScript 5
- Tailwind CSS
- 当プロジェクトのデザインシステムを使用
- エラーバウンダリ必須
- アクセシビリティ対応

コーディング規約:
- 関数コンポーネントのみ
- カスタムフックは use プレフィックス
- Props は interface で定義
`;
```

## 🔧 トラブルシューティング

### APIキーが見つからない
```bash
# APIキーマネージャーを使用
npm run akm export my-gemini GEMINI_API_KEY
```

### 生成されたコードの品質が低い
- プロンプトをより詳細に記述
- 具体的な要件を箇条書きで指定
- 参考となる既存コードのパスを含める

### 実行速度が遅い
- 並列実行数を増やす（-c オプション）
- タスクを小さく分割
- ネットワーク接続を確認

## 📊 実行例

```bash
$ npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tasks/dashboard -c 5

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

## 🎯 ベストプラクティス

1. **タスクファイルをGit管理**: 再利用可能にする
2. **プロンプトは具体的に**: 期待する出力を明確に記述
3. **小さく始める**: まず1-2個のファイルで試す
4. **生成後はレビュー**: AIの出力を必ず確認
5. **繰り返し改善**: プロンプトを調整して品質向上

---

このツールを使用することで、開発速度を10倍以上に向上させることができます。
質問がある場合は、このガイドを参照してください。