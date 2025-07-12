# 🚀 Enkai Quick Start

5分で始めるAI並列開発！

## 📋 概要

Enkai（宴会）は、複数のClaudeを使って並列開発を実現するツールです。
大きなタスクを自動的に小さなタスクに分割し、複数のClaude窓で同時に作業できます。

## 🎯 3ステップで開始

### ステップ1: インストール

```bash
# 現在のプロジェクトで使用する場合
npm install github:AoyamaRito/enkai

# またはグローバルにインストール
npm install -g github:AoyamaRito/enkai
```

### ステップ2: 基本的な使い方

```javascript
// quick-start.js
const { Enkai } = require('@ai-first/enkai')

async function main() {
  // オーケストレーターを初期化
  const enkai = new Enkai({
    tasksDir: 'my-claude-tasks'  // タスクファイルの保存先
  })

  // メインタスクを実行
  const { result, files } = await enkai.executeComplexTask(
    "ユーザープロフィール機能を実装する（表示・編集・保存）"
  )

  console.log(`✅ ${result.totalFiles}個のタスクに分割されました！`)
  console.log('📁 生成されたファイル:')
  files.forEach(file => console.log(`   - ${file}`))
}

main()
```

### ステップ3: 並列実行

1. **タスクファイルを確認**
   ```bash
   ls my-claude-tasks/
   # task-xxxxx-1.md
   # task-xxxxx-2.md
   # task-xxxxx-3.md
   # task-xxxxx-summary.md
   ```

2. **複数のClaude窓を開く**
   - ブラウザで3つのClaude.aiタブを開く
   - 各タブで新しい会話を開始

3. **各Claudeにタスクを割り当て**
   - Claude-1: `task-xxxxx-1.md`の内容をコピペ
   - Claude-2: `task-xxxxx-2.md`の内容をコピペ
   - Claude-3: `task-xxxxx-3.md`の内容をコピペ

4. **同時に実行！** 🎉

## 💡 実践例

### 例1: React コンポーネントの作成

```javascript
const enkai = new Enkai()

// 複数のコンポーネントを一度に作成
await enkai.executeComplexTask(
  "ECサイト用のコンポーネントを作成: 商品カード、カート、チェックアウトフォーム",
  {
    targetFiles: [
      'components/ProductCard.tsx',
      'components/ShoppingCart.tsx',
      'components/CheckoutForm.tsx'
    ]
  }
)
```

### 例2: API エンドポイントの実装

```javascript
// APIエンドポイントを並列で実装
await enkai.executeComplexTask(
  "RESTful APIを実装: ユーザー管理（CRUD）、認証、プロフィール画像アップロード"
)

// 結果:
// - api/users/route.ts (CRUD操作)
// - api/auth/route.ts (認証)
// - api/upload/route.ts (画像アップロード)
```

### 例3: 既存コードのリファクタリング

```javascript
// TypeScript移行を並列実行
await enkai.executeComplexTask(
  "すべてのJavaScriptファイルをTypeScriptに変換",
  {
    targetFiles: [
      'src/utils/*.js',
      'src/components/*.js',
      'src/hooks/*.js'
    ]
  }
)
```

## 🛠️ Next.js プロジェクトでの統合

### 1. APIルートを作成

```typescript
// app/api/claude-tasks/split/route.ts
import { Enkai } from '@ai-first/enkai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { mainTask } = await request.json()
  
  const enkai = new Enkai()
  const result = enkai.analyzeAndSplitTask(mainTask)
  const files = enkai.generateTaskFiles(result)
  
  return NextResponse.json({ 
    success: true,
    result,
    files 
  })
}
```

### 2. UIコンポーネントを追加

```typescript
// app/claude-tasks/page.tsx
'use client'
import { useState } from 'react'

export default function ClaudeTasksPage() {
  const [task, setTask] = useState('')
  const [result, setResult] = useState(null)
  
  const handleSplit = async () => {
    const res = await fetch('/api/claude-tasks/split', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mainTask: task })
    })
    const data = await res.json()
    setResult(data.result)
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Claude Task Splitter</h1>
      
      <textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="タスクを入力..."
        className="w-full p-2 border rounded"
        rows={3}
      />
      
      <button
        onClick={handleSplit}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        タスクを分割
      </button>
      
      {result && (
        <div className="mt-4">
          <p>✅ {result.totalFiles}個のタスクに分割されました</p>
        </div>
      )}
    </div>
  )
}
```

## 📊 コマンドラインツール

```bash
# デモを実行
npx enkai demo

# タスクを直接分割
npx enkai split "新機能を実装する"

# 進捗を確認
npx enkai status
```

## 🔥 プロのコツ

### 1. タスク説明は具体的に
```javascript
// ❌ 曖昧
"チャット機能を作る"

// ✅ 具体的
"リアルタイムチャット機能: メッセージ送受信、既読表示、タイピング表示、絵文字対応"
```

### 2. ファイルを明示的に指定
```javascript
// ファイルを指定して正確な分割
await enkai.executeComplexTask(
  "認証システムを実装",
  {
    targetFiles: [
      'middleware/auth.ts',
      'lib/jwt.ts',
      'components/LoginForm.tsx',
      'app/api/auth/route.ts'
    ]
  }
)
```

### 3. 定期的に進捗確認
```javascript
// 進捗レポートを生成
const report = enkai.generateProgressReport()
console.log(report)
// 全体進捗: 60%
// 完了: 3 ✅
// 進行中: 2 🔄
// 待機中: 0 ⏳
```

## ❓ よくある質問

**Q: 何個まで並列実行できる？**
A: Claude.aiのサブスクリプションで開ける窓の数だけ並列実行可能です（通常5-10個）

**Q: コンフリクトは起きない？**
A: 各ファイルが独立しているため、マージコンフリクトはほぼ発生しません

**Q: 既存プロジェクトでも使える？**
A: はい！既存のファイル構造を指定してタスクを分割できます

## 🚀 今すぐ始めよう！

```javascript
// start-now.js
const { Enkai } = require('@ai-first/enkai')

const enkai = new Enkai()
enkai.executeComplexTask(
  "あなたの実装したい機能をここに書く"
).then(({ result }) => {
  console.log(`🎉 ${result.totalFiles}人のClaudeが作業開始できます！`)
})
```

---

💡 **ヒント**: まずは小さなタスクから始めて、徐々に大きなタスクに挑戦してみましょう！