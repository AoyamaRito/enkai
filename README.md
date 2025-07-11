# 🔥 Enkai - AI-First開発ツール

Gemini APIを使用してAI-First開発を加速するコマンドラインツール。

## 🚀 クイックインストール

```bash
# リポジトリをクローン
git clone https://github.com/AoyamaRito/enkai.git
cd enkai

# インストール（ビルド、配置、PATH設定を自動実行）
./install-enkai.sh

# PATH設定を有効化
source ~/.zshrc  # または source ~/.bashrc
```

### システム全体へのインストール（オプション）

```bash
# /usr/local/bin にインストール（管理者権限が必要）
sudo ./install-enkai.sh --system
```

## 📋 前提条件

- Go 1.18以上
- Node.js と npm（Gemini並列実行ツール用）
- Gemini API キー（[Google AI Studio](https://makersuite.google.com/app/apikey)から取得）

## 🔧 基本的な使い方

### APIキーの設定

```bash
# APIキーを設定（~/.enkai/config.jsonに保存）
enkai api set YOUR_GEMINI_API_KEY

# 設定状態を確認
enkai api status

# APIキーを削除
enkai api delete
```

### Gemini並列実行ツール

```bash
# テンプレートから並列実行
enkai gemini from-template dashboard-components -c 3

# 出力先を指定
enkai gemini from-template todo-app --output ./src/components

# プリセットを使用
enkai gemini create-game-components
```

## 📝 テンプレート形式

`templates/`ディレクトリにJSONファイルを作成：

```json
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "AI-First原則に従い、完全自己完結のコンポーネントを実装"
  }
]
```

## AI-First開発原則

1. **完全自己完結**: 1ファイル = 1つの完全な機能
2. **外部依存最小限**: React/Next.js標準のみ使用
3. **重複コード歓迎**: 各ファイルが独立して理解可能
4. **即座修正可能**: 「このファイルの〇〇を変更」で完結

## ディレクトリ構造

```
enkai/
├── gemini-parallel.ts      # 並列実行エンジン
├── api-key-manager.ts      # APIキー管理ツール
├── app/                    # Next.js Webインターフェース
├── templates/              # タスクテンプレート
├── tasks/                  # タスクJSON格納場所
└── CLAUDE.md              # AI-First開発原則詳細
```

## 🛠 手動ビルド

インストールスクリプトを使わずに手動でビルドする場合：

```bash
# ビルド
./build-enkai.sh

# 手動でインストール
cp enkai ~/bin/
chmod +x ~/bin/enkai

# PATHに追加
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 📚 コマンドリファレンス

```bash
enkai --help              # ヘルプを表示
enkai version             # バージョン情報
enkai api set <KEY>       # APIキーを設定
enkai api delete          # APIキーを削除
enkai api status          # APIキーの状態確認
enkai gemini <command>    # Gemini並列実行ツール
```

## 🔍 トラブルシューティング

### enkaiコマンドが見つからない

```bash
# PATHを確認
echo $PATH | grep -q "$HOME/bin" || echo "~/bin がPATHに含まれていません"

# 手動でPATHに追加
export PATH="$HOME/bin:$PATH"
```

### APIキーエラー

```bash
# APIキーが設定されているか確認
enkai api status

# 再設定
enkai api set YOUR_GEMINI_API_KEY
```

## 開発環境

```bash
# インストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npm run typecheck

# リント
npm run lint
```

## ライセンス

MIT