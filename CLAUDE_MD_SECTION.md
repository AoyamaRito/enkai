# 既存のCLAUDE.mdに追加するセクション

以下の内容を既存のCLAUDE.mdの最後に追加してください：

---

## 🚀 Gemini並列実行ツール

このプロジェクトでは、Gemini 2.0 Flashを使用した並列コード生成が可能です。

### 基本的な使い方

```bash
# 環境変数設定
export GEMINI_API_KEY="your-api-key"

# タスクファイルから実行
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tasks/feature -c 5
```

### Claude Code内から直接実行

```typescript
import { executeGeminiTasks } from '~/romeo3/enkai/gemini-execute';

const tasks = [
  {
    fileName: 'Component.tsx',
    outputPath: './src/components/Component.tsx',
    prompt: 'コンポーネントの詳細仕様...'
  }
];

await executeGeminiTasks(tasks);
```

### タスクファイルの作成

```json
// tasks/new-feature.json
[
  {
    "fileName": "Feature.tsx",
    "outputPath": "./src/components/Feature.tsx",
    "prompt": "以下の仕様でコンポーネントを作成:\n- TypeScript使用\n- Tailwind CSS\n- エラーハンドリング\n- ローディング状態"
  }
]
```

### よく使うコマンド

```bash
# UIコンポーネントセット生成
npx tsx ~/romeo3/enkai/gemini-parallel.ts create-web-app

# カスタムタスク実行
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template ./tasks/my-tasks

# 並列数を調整（重いタスクは少なく）
npx tsx ~/romeo3/enkai/gemini-parallel.ts from-template tasks -c 2
```

### 実行例

1. **新機能の全コンポーネント生成**
   - Component.tsx
   - hooks/useFeature.ts
   - api/feature/route.ts
   - types/feature.ts
   → 約5秒で全て生成

2. **既存コンポーネントのテスト生成**
   - 各コンポーネントの.test.tsxファイル
   → 10個のテストファイルを10秒で生成

### 注意事項

- 生成されたコードは必ずレビューすること
- プロンプトは具体的に記述（期待する出力を明確に）
- APIキーは環境変数で管理（コミットしない）

詳細: `~/romeo3/enkai/README.md`