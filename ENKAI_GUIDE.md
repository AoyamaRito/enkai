# 🚀 Enkai（宴会）完全ガイド

## 📋 概要

Enkai（宴会）は、Gemini APIを使用してAI-First開発を加速するCLIツールです。複数のコンポーネントを並列生成し、開発速度を10倍以上に向上させます。

## 🎯 クイックスタート（3分で開始）

### 1️⃣ 初回セットアップ
```bash
# enkaiがインストール済みの場合
source ~/enkai/enkai-env-setup.sh
```

### 2️⃣ APIキー設定
```bash
# 方法1: 環境変数（推奨）
export GEMINI_API_KEY="YOUR_API_KEY_HERE"

# 方法2: enkaiコマンドで設定
enkai api set "YOUR_API_KEY_HERE"

# 設定確認
enkai api status
```

### 3️⃣ 実行
```bash
# テンプレートから実行
enkai gemini from-template dashboard-components -c 5

# 出力先を指定
enkai gemini from-template todo-app --output ./src/components
```

## 💡 基本的な使い方

### プリセットコマンド
```bash
# ゲーム系コンポーネント（5個）
enkai gemini create-game-components

# Webアプリ系（3個）
enkai gemini create-web-app

# 利用可能なテンプレート確認
ls ~/enkai/templates/
```

### カスタムタスクの作成と実行
```bash
# タスクJSON作成
cat > tasks/my-feature.json << 'EOF'
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "AI-First原則で[機能]を実装: 完全自己完結、外部依存なし"
  }
]
EOF

# 実行
enkai gemini from-template tasks/my-feature -c 5
```

## 🎯 AI-First原則チェックリスト

### ✅ 必須プロンプト要素
- 「AI-First原則に従い」
- 「完全自己完結」
- 「外部依存なし」
- 「1ファイルで全機能完結」

### ❌ 禁止事項
- カスタムhooks
- 外部atoms
- 共有utils
- 外部型定義

### ✅ 推奨事項
- ファイル内useState/useReducer
- ファイル内型定義
- 重複コード歓迎
- インラインスタイル + Tailwind

## 📝 実践的なテンプレート例

### 基本的なコンポーネント
```json
[
  {
    "fileName": "MyComponent.tsx",
    "outputPath": "./components/MyComponent.tsx",
    "prompt": "AI-First原則に従い、完全自己完結で[機能の説明]を実装。外部依存なし、ファイル内で全ての型定義・状態管理・API通信を完結。Tailwind CSSでスタイリング。"
  }
]
```

### フル機能コンポーネント（API込み）
```json
[
  {
    "fileName": "FeatureComplete.tsx",
    "outputPath": "./components/FeatureComplete.tsx",
    "prompt": "AI-First原則で実装:\n- [主要機能]\n- API通信機能（fetch直書き）\n- 状態管理（useState/useReducer）\n- エラーハンドリング\n- ローディング表示\n- 完全自己完結、外部依存なし"
  }
]
```

## 🔧 トラブルシューティング

### コマンドが見つからない
```bash
# 方法1: PATH追加
export PATH="$HOME/bin:$PATH"

# 方法2: フルパス実行
~/bin/enkai gemini from-template [タスク名]

# 方法3: 環境設定再読み込み
source ~/enkai/enkai-env-setup.sh
```

### APIキーエラー
```bash
# 確認
enkai api status

# 再設定
enkai api set "YOUR_API_KEY_HERE"

# 環境変数で直接設定
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### 実行エラーの対処
```bash
# ディレクトリ作成
mkdir -p templates tasks

# 権限付与
chmod +x ~/bin/enkai

# 最新版に更新
cd ~/enkai && git pull
```

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

## 💡 プロのコツ

1. **3つ以上のファイル生成時は必ずenkaiを使用**
2. **並列数は5-10が最適**（多すぎるとAPI制限に注意）
3. **プロンプトは具体的に**（期待する機能を明確に記述）
4. **生成後は動作確認のみ**（コードレビュー不要）

## 🚨 緊急時のワンライナー

```bash
# 環境設定 + APIキー設定 + 実行
source ~/enkai/enkai-env-setup.sh && export GEMINI_API_KEY="YOUR_API_KEY_HERE" && enkai gemini from-template dashboard-components
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

## 🚨 重要な注意事項

1. **必ずAI-First原則を適用**
   - 外部依存最小限
   - 1ファイル完結
   - 重複コード歓迎

2. **3つ以上のファイル生成時は必ずenkai使用**
   - 逐次生成は禁止
   - 並列実行で効率化

3. **APIキーは環境変数で管理**
   - コミットしない
   - .envファイルは.gitignoreに追加

4. **出力先の確認**
   - デフォルト: カレントディレクトリ
   - 推奨: `--output ./src/components` 等で明示的に指定