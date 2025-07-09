/**
 * 基本的な使用例
 */

const { ClaudeOrchestrator } = require('claude-orchestrator')

async function basicExample() {
  console.log('🚀 Claude Orchestrator - 基本的な使用例\n')
  
  const orchestrator = new ClaudeOrchestrator({
    tasksDir: 'example-tasks'
  })
  
  // シンプルなタスク分割
  const { result, files } = await orchestrator.executeComplexTask(
    "ブログシステムを実装する：記事一覧、記事詳細、記事作成の機能"
  )
  
  console.log('✅ タスク分割完了！')
  console.log(`📊 ${result.totalFiles}個のタスクに分割されました`)
  console.log(`⏱️  推定作業時間: ${result.estimatedTime}`)
  console.log('\n📁 生成されたファイル:')
  files.forEach(file => console.log(`   - ${file}`))
  
  // 次のステップを表示
  console.log('\n🎯 次のステップ:')
  console.log('1. 複数のClaude窓を開く')
  console.log('2. 各窓に生成されたタスクファイルの内容をコピー')
  console.log('3. 並列で実装開始！')
  
  // 進捗レポートを生成
  const report = orchestrator.generateProgressReport()
  console.log('\n📈 進捗レポート:')
  console.log(report)
}

// 実行
basicExample().catch(console.error)