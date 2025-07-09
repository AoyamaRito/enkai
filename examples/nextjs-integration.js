/**
 * Next.js プロジェクトでの統合例
 */

const { ClaudeTaskManager } = require('claude-orchestrator')

// API Route の例
// app/api/claude-tasks/split/route.ts
const apiRouteExample = `
import { ClaudeTaskManager } from 'claude-orchestrator'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { mainTask, targetFiles } = await request.json()
    
    const manager = new ClaudeTaskManager({
      tasksDir: 'claude-tasks'
    })
    
    const result = manager.analyzeAndSplitTask(mainTask, targetFiles)
    const files = manager.generateTaskFiles(result)
    
    return NextResponse.json({ 
      success: true,
      result,
      files,
      message: \`\${result.totalFiles}個のタスクに分割されました\`
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'タスク分割中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
`

// React コンポーネントの例
const componentExample = `
'use client'
import { useState } from 'react'

export function ClaudeTaskDashboard() {
  const [mainTask, setMainTask] = useState('')
  const [targetFiles, setTargetFiles] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleSplit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/claude-tasks/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mainTask,
          targetFiles: targetFiles.split('\\n').filter(f => f.trim())
        })
      })
      
      const data = await response.json()
      setResult(data.result)
      
      // 成功メッセージ
      alert(\`✅ \${data.result.totalFiles}個のタスクに分割されました！\`)
    } catch (error) {
      alert('❌ エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Claude Task Splitter</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            メインタスク
          </label>
          <textarea
            value={mainTask}
            onChange={(e) => setMainTask(e.target.value)}
            placeholder="例: ユーザー認証システムを実装する"
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            対象ファイル（任意）
          </label>
          <textarea
            value={targetFiles}
            onChange={(e) => setTargetFiles(e.target.value)}
            placeholder="components/AuthForm.tsx
app/api/auth/route.ts
middleware/auth.ts"
            className="w-full p-3 border rounded-lg"
            rows={4}
          />
        </div>
        
        <button
          onClick={handleSplit}
          disabled={loading || !mainTask.trim()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'タスク分割中...' : 'タスクを分割'}
        </button>
      </div>
      
      {result && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">分割結果</h2>
          <p>📊 総タスク数: {result.totalFiles}</p>
          <p>⏱️ 推定時間: {result.estimatedTime}</p>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">サブタスク:</h3>
            <ul className="space-y-1">
              {result.subTasks.map(task => (
                <li key={task.id} className="text-sm">
                  📁 {task.file} ({task.priority})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
`

console.log('📝 Next.js統合例')
console.log('\n🔧 API Route:')
console.log(apiRouteExample)
console.log('\n⚛️  React Component:')
console.log(componentExample)

// 実際の統合デモ
async function nextjsDemo() {
  console.log('\n🚀 Next.js統合デモ\n')
  
  const manager = new ClaudeTaskManager({
    tasksDir: 'nextjs-demo-tasks'
  })
  
  // Next.js特有のタスク例
  const nextjsTasks = [
    "認証システムを実装する（middleware、API route、UI）",
    "データベース統合（Prisma、CRUD操作、型定義）",
    "リアルタイム機能（WebSocket、通知、チャット）"
  ]
  
  for (const task of nextjsTasks) {
    console.log(`📋 処理中: "${task}"`)
    const result = manager.analyzeAndSplitTask(task)
    const files = manager.generateTaskFiles(result)
    console.log(`✅ ${result.totalFiles}個のタスクに分割`)
    console.log(`📁 ファイル: ${files.length}個生成\\n`)
  }
  
  console.log('🎯 Next.js統合完了！')
  console.log('各タスクファイルを確認して、複数のClaude窓で並列実行してください。')
}

// 実行
nextjsDemo().catch(console.error)