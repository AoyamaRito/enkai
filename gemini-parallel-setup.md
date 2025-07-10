# Gemini Parallel セットアップガイド

## クイックスタート（3分で始める）

```bash
# 1. クローンまたはファイルをコピー
git clone https://github.com/yourusername/your-project.git
cd your-project

# 2. 必要なファイルのみをコピー（既存プロジェクトの場合）
cp path/to/gemini-parallel.ts ./
cp -r path/to/templates ./

# 3. 依存関係インストール
npm install @google/generative-ai@0.21.0 commander@12.1.0 chalk@5.4.1 ora@8.2.0 p-limit@5.0.0 tsx

# 4. APIキー設定
export GEMINI_API_KEY="your-api-key"

# 5. 実行！
npx tsx gemini-parallel.ts create-web-app
```

## 詳細セットアップ

### 方法1: 既存プロジェクトに追加

```bash
# 必要なファイルをコピー
cp /path/to/gemini-parallel.ts ./tools/
mkdir -p templates
cp /path/to/templates/*.json ./templates/

# package.jsonに依存関係を追加
npm install --save-dev @google/generative-ai commander chalk ora p-limit tsx

# スクリプトを追加（オプション）
npm pkg set scripts.gen="tsx tools/gemini-parallel.ts"
```

### 方法2: 新規プロジェクトとして

```bash
# プロジェクト作成
mkdir gemini-code-generator
cd gemini-code-generator
npm init -y

# TypeScript設定
npm install --save-dev typescript tsx @types/node
npx tsc --init

# 依存関係インストール
npm install @google/generative-ai commander chalk ora p-limit

# ファイル配置
touch gemini-parallel.ts
mkdir templates
```

### 方法3: グローバルツールとして

```bash
# グローバルインストール用package.json作成
mkdir ~/gemini-tools
cd ~/gemini-tools

cat > package.json << EOF
{
  "name": "gemini-parallel-tool",
  "version": "1.0.0",
  "bin": {
    "gemini-gen": "./gemini-parallel.ts"
  },
  "dependencies": {
    "@google/generative-ai": "0.21.0",
    "commander": "12.1.0",
    "chalk": "5.4.1",
    "ora": "8.2.0",
    "p-limit": "5.0.0"
  }
}
EOF

# ファイルコピーとインストール
cp /path/to/gemini-parallel.ts ./
npm install
npm link

# どこからでも使用可能に
gemini-gen create-web-app
```

## 環境変数設定

### bash/zsh
```bash
# .bashrc または .zshrc に追加
export GEMINI_API_KEY="your-api-key"

# 即座に反映
source ~/.bashrc  # または source ~/.zshrc
```

### Windows (PowerShell)
```powershell
# 永続的に設定
[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "your-api-key", "User")

# セッション内で設定
$env:GEMINI_API_KEY = "your-api-key"
```

### .env ファイル使用
```bash
# .env ファイル作成
echo 'GEMINI_API_KEY=your-api-key' > .env

# dotenv パッケージインストール
npm install dotenv

# gemini-parallel.ts の先頭に追加
import 'dotenv/config';
```

## トラブルシューティング

### tsxが見つからない
```bash
# ローカルインストール
npm install --save-dev tsx

# グローバルインストール
npm install -g tsx
```

### 権限エラー (macOS/Linux)
```bash
chmod +x gemini-parallel.ts
```

### Node.jsバージョンエラー
```bash
# Node.js 18以上が必要
node --version

# nvm使用の場合
nvm install 18
nvm use 18
```

## 最小構成（コピペ用）

必要最小限のpackage.json:
```json
{
  "name": "my-project",
  "type": "module",
  "scripts": {
    "gen": "tsx gemini-parallel.ts"
  },
  "devDependencies": {
    "@google/generative-ai": "0.21.0",
    "commander": "12.1.0",
    "chalk": "5.4.1",
    "ora": "8.2.0",
    "p-limit": "5.0.0",
    "tsx": "^4.0.0"
  }
}
```

実行:
```bash
npm install
export GEMINI_API_KEY="your-key"
npm run gen create-web-app
```