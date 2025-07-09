# 📚 Claude Orchestrator Examples

実践的な使用例とサンプルコード

## 🚀 基本的な使用例

### [basic-usage.js](./basic-usage.js)
```bash
node examples/basic-usage.js
```
- 基本的なタスク分割
- 進捗レポート生成
- 初心者向けの完全なサンプル

## ⚛️ Next.js統合例

### [nextjs-integration.js](./nextjs-integration.js)
```bash
node examples/nextjs-integration.js
```
- APIルートの実装方法
- Reactコンポーネントの例
- リアルタイム統合デモ

## 🎯 高度な使用例

### [advanced-usage.js](./advanced-usage.js)
```bash
node examples/advanced-usage.js
```
- カスタム設定での初期化
- 大規模プロジェクトの分割
- バッチ処理での状態更新
- カテゴリ別分類

## 💻 CLIツール

### [cli-tool.js](./cli-tool.js)
```bash
# 実行可能にする
chmod +x examples/cli-tool.js

# 使用方法
./examples/cli-tool.js split "認証システムを実装する"
./examples/cli-tool.js status
./examples/cli-tool.js demo
./examples/cli-tool.js clean
```

## 📋 実行手順

1. **必要なパッケージをインストール**
   ```bash
   npm install
   ```

2. **例を実行**
   ```bash
   # 基本例
   node examples/basic-usage.js
   
   # Next.js統合例
   node examples/nextjs-integration.js
   
   # 高度な使用例
   node examples/advanced-usage.js
   ```

3. **生成されたタスクファイルを確認**
   ```bash
   ls example-tasks/
   ls nextjs-demo-tasks/
   ls advanced-tasks/
   ```

## 🎯 各例の特徴

| 例                | 特徴                           | 対象           |
|-------------------|--------------------------------|----------------|
| basic-usage       | シンプルな分割・実行           | 初心者         |
| nextjs-integration| Next.js特有の実装パターン      | Next.js開発者  |
| advanced-usage    | 大規模プロジェクト対応         | 上級者         |
| cli-tool          | コマンドライン操作             | 自動化・CI     |

## 💡 カスタマイズ例

### 独自のファイルパターンを追加
```javascript
const orchestrator = new ClaudeOrchestrator({
  filePatterns: {
    custom: {
      'mobile': ['app/**/*.tsx', 'components/mobile/**/*.tsx'],
      'desktop': ['components/desktop/**/*.tsx'],
      'shared': ['lib/**/*.ts', 'utils/**/*.ts']
    }
  }
})
```

### 特定のプロジェクト構造に対応
```javascript
const result = await orchestrator.executeComplexTask(
  "モバイルアプリのUI実装",
  {
    targetFiles: [
      'src/screens/HomeScreen.tsx',
      'src/screens/ProfileScreen.tsx',
      'src/components/TabBar.tsx',
      'src/hooks/useAuth.ts'
    ]
  }
)
```

## 🔧 デバッグ・トラブルシューティング

### ログ出力を詳細にする
```javascript
const orchestrator = new ClaudeOrchestrator({
  debug: true,  // 詳細ログ
  tasksDir: 'debug-tasks'
})
```

### ファイル生成の確認
```bash
# 生成されたファイルの確認
find . -name "*.md" -path "*/claude-tasks/*"

# 内容の確認
cat example-tasks/task-*-1.md
```

## 📈 パフォーマンス測定

### 分割時間の測定
```javascript
console.time('タスク分割')
const result = await orchestrator.executeComplexTask(task)
console.timeEnd('タスク分割')
```

### 並列実行の効果測定
```javascript
// 従来の開発時間: 5時間
// Claude並列実行: 30分
// 効率化倍率: 10倍
```

---

🎯 **これらの例を参考に、あなたのプロジェクトに最適な使い方を見つけてください！**