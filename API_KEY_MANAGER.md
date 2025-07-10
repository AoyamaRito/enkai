# APIキー管理ツール

ローカルで複数のAPIキーを安全に管理するためのCLIツールです。

## 特徴

- 🔐 **暗号化保存**: AES-256で暗号化してローカル保存
- 🔑 **複数キー管理**: 複数のサービスのAPIキーを一元管理
- 📤 **簡単エクスポート**: .envファイルやシェル環境変数へ出力
- 🎯 **サービス別管理**: Gemini、OpenAI、GitHub等を個別管理
- 🛡️ **安全**: APIキーは`~/.api-keys/`に暗号化して保存

## インストール

```bash
# 依存関係インストール
npm install

# 実行権限付与（オプション）
chmod +x api-key-manager.ts
```

## 使い方

### APIキーを追加

```bash
# 基本的な追加
npx tsx api-key-manager.ts add my-gemini "AIzaSy..." gemini

# 説明付きで追加
npx tsx api-key-manager.ts add my-gemini "AIzaSy..." gemini -d "本番用Geminiキー"

# 他のサービスの例
npx tsx api-key-manager.ts add github-token "ghp_..." github -d "個人アクセストークン"
npx tsx api-key-manager.ts add openai-prod "sk-..." openai -d "本番環境用"
```

### APIキー一覧を表示

```bash
npx tsx api-key-manager.ts list

# 出力例:
# 🔑 保存されているAPIキー:
# 
# 1. my-gemini
#    サービス: gemini
#    説明: 本番用Geminiキー
#    作成日: 2024/1/9
# 
# 2. github-token
#    サービス: github
#    説明: 個人アクセストークン
#    作成日: 2024/1/9
```

### APIキーを取得（復号化）

```bash
# キーを表示
npx tsx api-key-manager.ts get my-gemini
```

### .envファイルにエクスポート

```bash
# 特定のキーをエクスポート
npx tsx api-key-manager.ts export my-gemini GEMINI_API_KEY

# 全てのキーを一括エクスポート
npx tsx api-key-manager.ts export-all
```

### シェル環境変数として使用

```bash
# エクスポートコマンドを表示
npx tsx api-key-manager.ts shell my-gemini

# 実行例:
# export GEMINI_API_KEY="AIzaSy..."

# 直接実行する場合
eval $(npx tsx api-key-manager.ts shell my-gemini | grep export)
```

### APIキーを削除

```bash
npx tsx api-key-manager.ts remove my-gemini
```

## 実践的な使用例

### 1. プロジェクト開始時

```bash
# 必要なAPIキーを追加
npx tsx api-key-manager.ts add gemini-dev "AIzaSy..." gemini -d "開発用"
npx tsx api-key-manager.ts add github-actions "ghp_..." github -d "CI/CD用"

# .envファイルに一括エクスポート
npx tsx api-key-manager.ts export-all
```

### 2. 環境切り替え

```bash
# 開発環境用
npx tsx api-key-manager.ts export gemini-dev GEMINI_API_KEY

# 本番環境用
npx tsx api-key-manager.ts export gemini-prod GEMINI_API_KEY
```

### 3. CI/CD用

```bash
# GitHub Actions用のトークンを取得
TOKEN=$(npx tsx api-key-manager.ts get github-actions | grep "APIキー:" | cut -d' ' -f2)
```

## セキュリティ

- APIキーは`~/.api-keys/keys.json`に暗号化保存
- 暗号化にはAES-256-CBCを使用
- マスターキーは自動生成され同じファイルに保存
- ファイルは他のユーザーから読み取り不可

## エイリアス設定（便利）

```bash
# ~/.bashrc または ~/.zshrc に追加
alias akm="npx tsx ~/path/to/api-key-manager.ts"

# 使用例
akm list
akm add my-key "..." service
akm export my-key ENV_VAR
```

## トラブルシューティング

### APIキーが見つからない

```bash
# 保存されているキーを確認
npx tsx api-key-manager.ts list
```

### .envファイルに追記されない

```bash
# カレントディレクトリに.envファイルがあるか確認
ls -la .env
```

### 暗号化エラー

```bash
# 設定ファイルをリセット（注意：全てのキーが削除されます）
rm -rf ~/.api-keys
```