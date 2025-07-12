# 他プロジェクトのCLAUDE.mdに追加する内容

以下をコピーして、既存プロジェクトのCLAUDE.mdに追加してください：

---

## 🚀 Gemini並列実行ツール（GitHub版）

**重要**: 複数ファイル生成時は必ずこのツールを使用。逐次生成禁止。

### セットアップ（初回のみ）
```bash
# ツールをクローン
git clone https://github.com/AoyamaRito/enkai.git ~/tools/enkai
cd ~/tools/enkai && npm install

# APIキー設定
npm run akm add my-gemini "your-api-key" gemini
```

### 実行コマンド
```bash
# APIキー環境変数設定
eval $(cd ~/tools/enkai && npm run akm shell my-gemini | grep export)

# タスク実行
npx tsx ~/tools/enkai/gemini-parallel.ts from-template [タスク名] -c 5
```

### タスクJSON作成
```bash
# プロジェクト内にtemplatesディレクトリ作成
mkdir -p templates

# タスクファイル作成 (templates/feature.json)
cat > templates/feature.json << 'EOF'
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./src/components/Component.tsx",
    "prompt": "完全自己完結Reactコンポーネント: [具体的な仕様]"
  }
]
EOF

# 実行
npx tsx ~/tools/enkai/gemini-parallel.ts from-template feature
```

### Claude Code内から実行
```typescript
import { executeGeminiTasks } from '~/tools/enkai/gemini-execute';

// APIキー設定
process.env.GEMINI_API_KEY = 'your-api-key';

// タスク定義と実行
await executeGeminiTasks([
  {
    fileName: 'Feature.tsx',
    outputPath: './src/Feature.tsx',
    prompt: '機能の詳細仕様...'
  }
]);
```

### プリセットコマンド
```bash
# ゲームコンポーネント5個
npx tsx ~/tools/enkai/gemini-parallel.ts create-game-components

# Webアプリコンポーネント3個
npx tsx ~/tools/enkai/gemini-parallel.ts create-web-app
```

### AI実装ルール
1. **3つ以上のファイル → 必ずGemini並列実行**
2. **実行前にAPIキー確認**
3. **完全自己完結原則でプロンプト作成**

### トラブルシューティング
```bash
# APIキーエラー
cd ~/tools/enkai && npm run akm list  # 保存済みキー確認

# 最新版に更新
cd ~/tools/enkai && git pull && npm install
```

---