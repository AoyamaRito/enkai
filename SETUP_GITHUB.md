# GitHub リポジトリセットアップ手順

## 1. 新規リポジトリの作成

1. GitHubにログイン
2. 「New repository」をクリック
3. 以下の設定で作成:
   - Repository name: `claude-orchestrator`
   - Description: `AI-First開発のためのClaude並列タスク管理システム`
   - Public リポジトリとして作成
   - READMEは追加しない（既に作成済み）
   - .gitignoreは追加しない（既に作成済み）
   - LicenseはMITを選択（または追加しない、既に作成済み）

## 2. ローカルリポジトリの初期化とプッシュ

```bash
# claude-orchestratorディレクトリに移動
cd claude-orchestrator

# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "🚀 Initial commit: Claude Orchestrator - AI-First並列開発システム"

# mainブランチに切り替え（必要な場合）
git branch -M main

# リモートリポジトリを追加（YOUR_USERNAMEを実際のユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/claude-orchestrator.git

# プッシュ
git push -u origin main
```

## 3. NPMパッケージとして公開（オプション）

```bash
# TypeScriptをビルド
npm install
npm run build

# NPMにログイン
npm login

# パッケージを公開
npm publish --access public
```

## 4. 他のプロジェクトでの使用方法

### GitHubから直接インストール

```bash
# 公開リポジトリからインストール
npm install github:YOUR_USERNAME/claude-orchestrator

# プライベートリポジトリの場合
npm install git+ssh://git@github.com:YOUR_USERNAME/claude-orchestrator.git
```

### NPMからインストール（公開した場合）

```bash
npm install @ai-first/claude-orchestrator
```

## 5. 使用例

```typescript
// 既存プロジェクトでの使用
import { ClaudeOrchestrator } from 'claude-orchestrator'

const orchestrator = new ClaudeOrchestrator()
const result = await orchestrator.executeComplexTask("新機能を実装する")
```

## 6. 推奨される追加設定

### GitHub Actions（自動ビルド）

`.github/workflows/build.yml`を作成:

```yaml
name: Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
```

### バージョン管理

新しいバージョンをリリースする際:

```bash
# バージョンを更新
npm version patch  # または minor, major

# タグ付きでプッシュ
git push --follow-tags

# NPMに公開（該当する場合）
npm publish
```

## 完了！

これで、Claude Orchestratorを任意のプロジェクトで使用できるようになりました。
AI-First開発の革命を、すべてのプロジェクトに広げましょう！🚀