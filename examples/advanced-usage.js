/**
 * 高度な使用例
 */

const { ClaudeOrchestrator } = require('claude-orchestrator')

async function advancedExample() {
  console.log('🚀 Claude Orchestrator - 高度な使用例\n')
  
  // カスタム設定でオーケストレーターを初期化
  const orchestrator = new ClaudeOrchestrator({
    tasksDir: 'advanced-tasks',
    maxParallelTasks: 8,
    filePatterns: {
      // カスタムファイルパターン
      custom: {
        'backend': ['api/**/*.ts', 'lib/**/*.ts', 'middleware/**/*.ts'],
        'frontend': ['components/**/*.tsx', 'pages/**/*.tsx', 'hooks/**/*.ts'],
        'database': ['prisma/**/*.ts', 'migrations/**/*.sql'],
        'tests': ['**/*.test.ts', '**/*.spec.ts']
      }
    }
  })
  
  // 複雑なタスクの実行
  const complexTask = `
    大規模ECサイトのフルスタック実装:
    1. バックエンド: REST API、認証、決済処理、在庫管理
    2. フロントエンド: 商品一覧、カート、チェックアウト、管理画面
    3. データベース: スキーマ設計、マイグレーション、シード
    4. テスト: 単体テスト、統合テスト、E2Eテスト
  `
  
  const { result, files, instructions } = await orchestrator.executeComplexTask(
    complexTask,
    {
      targetFiles: [
        // バックエンド
        'app/api/products/route.ts',
        'app/api/auth/route.ts',
        'app/api/payments/route.ts',
        'app/api/inventory/route.ts',
        'lib/auth.ts',
        'lib/payment.ts',
        'middleware/auth.ts',
        
        // フロントエンド
        'components/ProductList.tsx',
        'components/ShoppingCart.tsx',
        'components/Checkout.tsx',
        'components/AdminDashboard.tsx',
        'hooks/useAuth.ts',
        'hooks/useCart.ts',
        
        // データベース
        'prisma/schema.prisma',
        'prisma/migrations/001_initial.sql',
        'prisma/seed.ts',
        
        // テスト
        'tests/api/products.test.ts',
        'tests/components/ProductList.test.tsx',
        'tests/e2e/checkout.spec.ts'
      ]
    }
  )
  
  console.log('✅ 大規模タスク分割完了！')
  console.log(`📊 ${result.totalFiles}個のタスクに分割されました`)
  console.log(`⏱️  推定作業時間: ${result.estimatedTime}`)
  
  // カテゴリ別に分類
  const categories = {
    backend: result.subTasks.filter(t => t.file.includes('api/') || t.file.includes('lib/') || t.file.includes('middleware/')),
    frontend: result.subTasks.filter(t => t.file.includes('components/') || t.file.includes('hooks/')),
    database: result.subTasks.filter(t => t.file.includes('prisma/')),
    tests: result.subTasks.filter(t => t.file.includes('test'))
  }
  
  console.log('\n📁 カテゴリ別分類:')
  Object.entries(categories).forEach(([category, tasks]) => {
    console.log(`\n${category.toUpperCase()} (${tasks.length}個):`)
    tasks.forEach(task => console.log(`  - ${task.file} (${task.priority})`))
  })
  
  // 実行手順
  console.log('\n📋 実行手順:')
  console.log(instructions)
  
  // バッチ処理での状態更新例
  console.log('\n🔄 バッチ処理での状態更新:')
  const updates = [
    { taskId: result.subTasks[0].id, status: 'assigned', assignedTo: 'Claude-1' },
    { taskId: result.subTasks[1].id, status: 'assigned', assignedTo: 'Claude-2' },
    { taskId: result.subTasks[2].id, status: 'assigned', assignedTo: 'Claude-3' }
  ]
  
  orchestrator.batchUpdateStatus(updates)
  console.log('✅ タスク状態を一括更新しました')
  
  // 進捗レポート生成
  const report = orchestrator.generateProgressReport()
  console.log('\n📈 進捗レポート:')
  console.log(report)
}

// 実行
advancedExample().catch(console.error)