#!/usr/bin/env node

/**
 * CLI ツールの例
 */

const { ClaudeOrchestrator } = require('claude-orchestrator')
const fs = require('fs')
const path = require('path')

// コマンドライン引数を解析
const args = process.argv.slice(2)
const command = args[0]

async function runCLI() {
  const orchestrator = new ClaudeOrchestrator({
    tasksDir: 'cli-tasks'
  })
  
  switch (command) {
    case 'split':
      await splitCommand(orchestrator, args.slice(1))
      break
    case 'status':
      await statusCommand(orchestrator)
      break
    case 'demo':
      await demoCommand(orchestrator)
      break
    case 'clean':
      await cleanCommand(orchestrator)
      break
    default:
      showHelp()
  }
}

async function splitCommand(orchestrator, args) {
  const taskDescription = args.join(' ')
  
  if (!taskDescription) {
    console.error('❌ タスクの説明を入力してください')
    console.log('例: claude-orchestrator split "認証システムを実装する"')
    return
  }
  
  console.log(`🚀 タスク分割開始: "${taskDescription}"`)
  
  const { result, files } = await orchestrator.executeComplexTask(taskDescription)
  
  console.log(`\\n✅ ${result.totalFiles}個のタスクに分割されました！`)
  console.log(`⏱️  推定作業時間: ${result.estimatedTime}`)
  
  console.log('\\n📁 生成されたファイル:')
  files.forEach(file => console.log(`  - ${file}`))
  
  console.log('\\n🎯 次のステップ:')
  console.log('1. 複数のClaude窓を開く')
  console.log('2. 各窓に対応するタスクファイルをコピー')
  console.log('3. 並列実行開始！')
}

async function statusCommand(orchestrator) {
  console.log('📊 タスク状況を確認中...')
  
  const report = orchestrator.generateProgressReport()
  console.log(report)
}

async function demoCommand(orchestrator) {
  console.log('🚀 Claude Orchestrator デモ実行\\n')
  
  const demoTasks = [
    "シンプルなTodoアプリを実装する",
    "認証機能付きブログシステムを作成する",
    "リアルタイムチャットアプリを構築する"
  ]
  
  for (const task of demoTasks) {
    console.log(`📋 処理中: "${task}"`)
    const { result } = await orchestrator.executeComplexTask(task)
    console.log(`✅ ${result.totalFiles}個のタスクに分割\\n`)
  }
  
  console.log('🎉 デモ完了！')
  console.log('cli-tasksディレクトリを確認してください。')
}

async function cleanCommand(orchestrator) {
  console.log('🧹 タスクファイルをクリーンアップ中...')
  
  orchestrator.cleanup()
  
  console.log('✅ クリーンアップ完了')
}

function showHelp() {
  console.log(`
🤖 Claude Orchestrator CLI

使用方法:
  claude-orchestrator <command> [options]

コマンド:
  split <task>    タスクを分割してファイルを生成
  status          現在の進捗状況を表示
  demo            デモを実行
  clean           タスクファイルをクリーンアップ

例:
  claude-orchestrator split "認証システムを実装する"
  claude-orchestrator status
  claude-orchestrator demo
  claude-orchestrator clean

オプション:
  -h, --help      このヘルプを表示
  -v, --version   バージョンを表示
`)
}

// エラーハンドリング付きで実行
runCLI().catch(error => {
  console.error('❌ エラーが発生しました:', error.message)
  process.exit(1)
})