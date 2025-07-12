# 🤖 Claude向け enkai使用ガイド

## 🚀 基本的な使い方

### 1. APIキーの確認と設定
```bash
# APIキーの状態確認
enkai api status

# APIキーが未設定の場合
enkai api set "YOUR_API_KEY_HERE"

# または環境変数で設定
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### 2. Gemini並列実行の基本
```bash
# テンプレートから実行（推奨）
enkai gemini from-template dashboard-components -c 5

# 出力先を指定
enkai gemini from-template todo-app --output ./src/components

# プリセット使用
enkai gemini create-game-components
```

## 📋 Claude用チェックリスト

### 複数ファイル生成時の手順
1. **3つ以上のファイル生成時は必ずenkaiを使用**
2. **テンプレートJSON作成**
   ```json
   [
     {
       "fileName": "Component.tsx",
       "outputPath": "./components/Component.tsx", 
       "prompt": "AI-First原則に従い、完全自己完結で実装..."
     }
   ]
   ```
3. **実行コマンド**
   ```bash
   # APIキー設定（必須）
   export GEMINI_API_KEY="YOUR_API_KEY_HERE"
   
   # テンプレート実行
   enkai gemini from-template tasks/[機能名] -c 5
   ```

## 🎯 AI-First原則の適用

### プロンプトに必ず含める内容
```
AI-First原則に従い、以下を実装:
- 完全自己完結（1ファイルで全機能完結）
- 外部依存なし（React/Next.js標準のみ）
- 重複コード歓迎（各ファイル独立）
- ファイル内で全ての型定義、関数、状態管理を完結
```

### 実装パターン例
```typescript
// ✅ 完全自己完結コンポーネントのテンプレート
export function ComponentName() {
  // 状態管理（このファイル内で完結）
  const [state, setState] = useState();
  
  // API通信（このファイル内で完結）
  const fetchData = async () => {
    const response = await fetch('/api/endpoint');
    return response.json();
  };
  
  // ユーティリティ（このファイル内で完結）
  const formatData = (data: any) => {
    // 処理
  };
  
  // UI（このファイル内で完結）
  return <div>...</div>;
}
```

## 🔧 トラブルシューティング

### APIキーエラーの場合
```bash
# 設定確認
enkai api status

# 再設定
enkai api set "YOUR_API_KEY_HERE"

# 環境変数で直接設定
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### PATHが通っていない場合
```bash
# 一時的な解決
export PATH="$HOME/bin:$PATH"

# または直接実行
~/bin/enkai gemini from-template [タスク名]

# またはフルパス
/Users/AoyamaRito/bin/enkai gemini from-template [タスク名]
```

### 環境設定を簡単に読み込む
```bash
# enkaiの環境設定を読み込む
source ~/enkai/enkai-env-setup.sh
```

## 📁 ディレクトリ構造

```
enkai/
├── templates/              # テンプレート置き場
│   ├── dashboard-components.json
│   ├── todo-app-tasks.json
│   └── [カスタムテンプレート].json
├── tasks/                  # タスクJSON置き場
├── test-output/           # 生成されたファイルの出力先
└── app/                   # Next.js Webインターフェース
```

## 💡 Claude用の便利なコマンド集

```bash
# 1. プロジェクトで初回セットアップ
cd [プロジェクトディレクトリ]
mkdir -p templates tasks
cp ~/enkai/templates/example.json ./templates/

# 2. 複数コンポーネント生成（例：ダッシュボード）
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
enkai gemini from-template dashboard-components -c 5

# 3. カスタムタスクの実行
cat > tasks/my-feature.json << 'EOF'
[
  {
    "fileName": "Feature.tsx",
    "outputPath": "./components/Feature.tsx",
    "prompt": "AI-First原則で実装: [具体的な要件]"
  }
]
EOF
enkai gemini from-template tasks/my-feature

# 4. 既存のプリセット確認
ls ~/enkai/templates/
```

## 🚨 重要な注意事項

1. **必ずAI-First原則を適用**
   - 外部依存最小限
   - 1ファイル完結
   - 重複コード歓迎

2. **3つ以上のファイル生成時は必ずenkai使用**
   - 逐次生成は禁止
   - 並列実行で効率化

3. **APIキーは環境変数で管理**
   ```bash
   export GEMINI_API_KEY="YOUR_API_KEY_HERE"
   ```

4. **出力先の確認**
   - デフォルト: カレントディレクトリ
   - 推奨: `--output ./src/components` 等で明示的に指定

## 🎯 典型的な使用シナリオ

### シナリオ1: 新機能の実装
```bash
# 1. タスクJSON作成
cat > tasks/new-feature.json << 'EOF'
[
  {
    "fileName": "FeatureList.tsx",
    "outputPath": "./components/FeatureList.tsx",
    "prompt": "AI-First原則: 一覧表示コンポーネント、ページネーション付き、完全自己完結"
  },
  {
    "fileName": "FeatureDetail.tsx",
    "outputPath": "./components/FeatureDetail.tsx", 
    "prompt": "AI-First原則: 詳細表示コンポーネント、編集機能付き、完全自己完結"
  },
  {
    "fileName": "FeatureForm.tsx",
    "outputPath": "./components/FeatureForm.tsx",
    "prompt": "AI-First原則: 入力フォーム、バリデーション付き、完全自己完結"
  }
]
EOF

# 2. 実行
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
enkai gemini from-template tasks/new-feature -c 3
```

### シナリオ2: 既存プリセット使用
```bash
# ゲーム系コンポーネント一括生成
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
enkai gemini create-game-components
```

## 📝 最後に

このガイドを参照することで、Claudeは効率的にenkaiツールを使用してAI-First開発を実践できます。常にAI-First原則を守り、完全自己完結型のコードを生成してください。