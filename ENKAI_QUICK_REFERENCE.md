# 🚀 enkai クイックリファレンス（Claude専用）

## 必須コマンド（これだけ覚えればOK）

### 1️⃣ 初回のみ: 環境設定
```bash
source ~/enkai/enkai-env-setup.sh
```

### 2️⃣ 毎回: APIキー設定
```bash
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### 3️⃣ 実行
```bash
# テンプレートから実行
enkai gemini from-template [テンプレート名] -c 5

# 出力先指定
enkai gemini from-template [テンプレート名] --output ./components
```

## 🎯 3ステップ実行例

### ステップ1: タスクJSON作成
```bash
cat > tasks/my-feature.json << 'EOF'
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "AI-First原則で[機能]を実装: 完全自己完結、外部依存なし"
  }
]
EOF
```

### ステップ2: 環境設定
```bash
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### ステップ3: 実行
```bash
enkai gemini from-template tasks/my-feature -c 5
```

## 📋 利用可能なプリセット

```bash
# ゲーム系コンポーネント（5個）
enkai gemini create-game-components

# Webアプリ系（3個）
enkai gemini create-web-app

# その他のテンプレート確認
ls ~/enkai/templates/
```

## 🔧 トラブルシューティング

### コマンドが見つからない
```bash
# 方法1: PATH追加
export PATH="$HOME/bin:$PATH"

# 方法2: フルパス実行
~/bin/enkai gemini from-template [タスク名]
```

### APIキーエラー
```bash
# 確認
enkai api status

# 設定
enkai api set "YOUR_API_KEY_HERE"
```

## 💡 AI-First原則チェックリスト

✅ **必須プロンプト要素**
- 「AI-First原則に従い」
- 「完全自己完結」
- 「外部依存なし」
- 「1ファイルで全機能完結」

✅ **禁止事項**
- カスタムhooks
- 外部atoms
- 共有utils
- 外部型定義

✅ **推奨事項**
- ファイル内useState/useReducer
- ファイル内型定義
- 重複コード歓迎
- インラインスタイル + Tailwind

## 🎯 コピペ用テンプレート

### 基本的なコンポーネント生成
```json
[
  {
    "fileName": "MyComponent.tsx",
    "outputPath": "./components/MyComponent.tsx",
    "prompt": "AI-First原則に従い、完全自己完結で[機能の説明]を実装。外部依存なし、ファイル内で全ての型定義・状態管理・API通信を完結。Tailwind CSSでスタイリング。"
  }
]
```

### API込みのフル機能コンポーネント
```json
[
  {
    "fileName": "FeatureComplete.tsx",
    "outputPath": "./components/FeatureComplete.tsx",
    "prompt": "AI-First原則で実装:\n- [主要機能]\n- API通信機能（fetch直書き）\n- 状態管理（useState/useReducer）\n- エラーハンドリング\n- ローディング表示\n- 完全自己完結、外部依存なし"
  }
]
```

## 🚨 緊急時のワンライナー

```bash
# 環境設定 + APIキー設定 + 実行
source ~/enkai/enkai-env-setup.sh && export GEMINI_API_KEY="YOUR_API_KEY_HERE" && enkai gemini from-template dashboard-components
```