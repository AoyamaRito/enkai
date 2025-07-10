# 🚀 Gemini並列実行ツール - クイックガイド

このプロジェクトでGemini並列実行ツールを使用して、複数のファイルを高速生成できます。

## 基本コマンド

```bash
# 5つのコンポーネントを並列生成
GEMINI_API_KEY="your-key" npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template your-tasks -c 5
```

## タスクファイルの例

```json
// tasks.json
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./src/components/Component.tsx", 
    "prompt": "Reactコンポーネントの詳細仕様..."
  }
]
```

## Claude Code内から実行

```typescript
import { executeGeminiTasks } from '~/romeo3/enkai/gemini-execute';

await executeGeminiTasks([
  {
    fileName: 'Feature.tsx',
    outputPath: './src/Feature.tsx',
    prompt: '機能の仕様...'
  }
]);
```

## よく使うパターン

### 1. UI コンポーネントセット
```bash
# Button, Input, Select, Modal を一括生成
npx tsx ~/romeo3/enkai/gemini-parallel.ts create-web-app
```

### 2. 機能単位での生成
```bash
# ユーザー管理機能（一覧、詳細、編集、API）
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template user-feature
```

### 3. テストファイル生成
```bash
# 既存コンポーネントのテストを一括作成
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tests
```

## Tips

- **並列数調整**: `-c 10` で最大10並列（デフォルト: 5）
- **APIキー管理**: `npm run akm add my-key "..." gemini`
- **実行時間**: 通常1ファイル2-3秒、5ファイルでも3-5秒

詳細は `~/romeo3/enkai/CLAUDE_PROJECT_TEMPLATE.md` を参照。