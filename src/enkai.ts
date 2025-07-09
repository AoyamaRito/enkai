/**
 * Enkai（宴会）- AI-First並列タスク管理システム
 * 完全自己完結型オーケストレーター
 */

// --- ここから追加 ---

// API料金とコスト計算関連の型定義
interface ModelPrice {
  input: number // 1トークンあたりの日本円
  output: number // 1トークンあたりの日本円
}

interface ModelPricing {
  pro: ModelPrice
  flash: ModelPrice
}

export interface CostEstimation {
  model: keyof ModelPricing
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
  subTaskCount: number
  estimatedTime: string
  costDetails: string
}

// Gemini APIの料金表（1ドル=146.5円で計算）
const PRICING: ModelPricing = {
  pro: {
    input: 0.000183125, // ($1.25 / 1M tokens) * 146.5
    output: 0.0007325,   // ($5.00 / 1M tokens) * 146.5
  },
  flash: {
    input: 0.0000109875, // ($0.075 / 1M tokens) * 146.5
    output: 0.00004395,  // ($0.30 / 1M tokens) * 146.5
  },
}

/**
 * 文字数に基づく簡易的なトークンカウンター
 * @param text カウント対象のテキスト
 * @returns トークン数（概算）
 */
const countTokens = (text: string): number => {
  // 英語圏のテキストやコードは平均4文字で1トークンと言われるため、
  // 安全マージンを見て文字数を2で割る簡易的な計算を採用
  return Math.ceil(text.length / 2)
}

// --- ここまで追加 ---


// 型定義（このファイル内で完結）
export interface EnkaiTask {
  id: string
  file: string
  taskType: 'create' | 'modify' | 'refactor' | 'fix'
  instructions: string
  priority: 'high' | 'medium' | 'low'
  dependencies: string[]
  expectedResult: string
  status: 'pending' | 'assigned' | 'completed'
  assignedTo?: string
  createdAt?: Date
  completedAt?: Date
}

export interface TaskSplitResult {
  mainTaskId: string
  subTasks: EnkaiTask[]
  estimatedTime: string
  totalFiles: number
}

export interface TaskSummary {
  total: number
  completed: number
  pending: number
  assigned: number
}

export interface EnkaiConfig {
  tasksDir?: string
  maxParallelTasks?: number
  autoAssign?: boolean
}

// ユーティリティ関数（このファイル内で完結）
const generateTaskId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const estimateTime = (taskCount: number): string => {
  const minutes = taskCount * 10
  if (minutes < 60) return `${minutes}分`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`
}

const analyzeTaskType = (description: string): EnkaiTask['taskType'] => {
  const keywords = {
    create: ['作成', '新規', '追加', 'create', 'add', 'new'],
    modify: ['修正', '変更', '更新', 'modify', 'update', 'change'],
    refactor: ['リファクタリング', '改善', '最適化', 'refactor', 'improve', 'optimize'],
    fix: ['修正', 'バグ', 'エラー', 'fix', 'bug', 'error']
  }
  
  const lowerDesc = description.toLowerCase()
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => lowerDesc.includes(word))) {
      return type as EnkaiTask['taskType']
    }
  }
  return 'modify'
}

const splitTaskDescription = (description: string, targetFiles?: string[]): string[] => {
  const sentences = description.split(/[。\n]/).filter(s => s.trim())
  const tasks: string[] = []
  
  if (targetFiles && targetFiles.length > 0) {
    targetFiles.forEach(file => {
      const relevantSentences = sentences.filter(s => 
        s.includes(file) || s.includes('全て') || s.includes('各')
      )
      if (relevantSentences.length > 0) {
        tasks.push(`${file}: ${relevantSentences.join('。')}`)
      }
    })
  } else {
    sentences.forEach(sentence => {
      if (sentence.includes('、')) {
        sentence.split('、').forEach(part => {
          if (part.trim()) tasks.push(part.trim())
        })
      } else {
        tasks.push(sentence)
      }
    })
  }
  
  return tasks.length > 0 ? tasks : [description]
}

export class Enkai {
  private tasks: Map<string, EnkaiTask> = new Map()
  private config: EnkaiConfig
  
  constructor(config?: EnkaiConfig) {
    this.config = {
      tasksDir: './enkai-tasks',
      maxParallelTasks: 10,
      autoAssign: true,
      ...config
    }
  }

  /**
   * タスクを分析して並列実行可能な形に分割
   */
  analyzeAndSplitTask(description: string, targetFiles?: string[]): TaskSplitResult {
    const mainTaskId = generateTaskId()
    const splitDescriptions = splitTaskDescription(description, targetFiles)
    
    const subTasks: EnkaiTask[] = splitDescriptions.map((desc, index) => {
      const taskId = `${mainTaskId}-${index + 1}`
      const taskType = analyzeTaskType(desc)
      
      const task: EnkaiTask = {
        id: taskId,
        file: targetFiles ? targetFiles[index] || `task-${index + 1}.md` : `task-${index + 1}.md`,
        taskType,
        instructions: desc,
        priority: index === 0 ? 'high' : 'medium',
        dependencies: [],
        expectedResult: `${desc}が完了していること`,
        status: 'pending',
        createdAt: new Date()
      }
      
      this.tasks.set(taskId, task)
      return task
    })
    
    return {
      mainTaskId,
      subTasks,
      estimatedTime: estimateTime(subTasks.length),
      totalFiles: subTasks.length
    }
  }

  // --- ここから追加 ---

  /**
   * API呼び出しの概算コストを計算します。
   * @param description - メインのタスク記述
   * @param options - コスト計算のオプション
   * @returns コスト見積もりの詳細
   */
  estimateCost(
    description: string,
    options: {
      targetFiles?: string[]
      model?: keyof ModelPricing
      averageOutputTokens?: number
    } = {}
  ): CostEstimation {
    const {
      targetFiles,
      model = 'flash', // デフォルトは高速・低価格なflashモデル
      averageOutputTokens = 1000, // 1タスクあたりの平均出力トークン数の想定
    } = options

    const result = this.analyzeAndSplitTask(description, targetFiles)
    const pricing = PRICING[model]
    let totalInputTokens = 0

    result.subTasks.forEach(task => {
      // 各サブタスクのプロンプトを生成（実際のAPI呼び出しを模倣）
      const prompt = this.generateTaskFileContent(task) // 既存の関数を流用
      totalInputTokens += countTokens(prompt)
    })

    const totalOutputTokens = result.subTasks.length * averageOutputTokens
    const inputCost = totalInputTokens * pricing.input
    const outputCost = totalOutputTokens * pricing.output
    const totalCost = inputCost + outputCost

    const costDetails = `
## コスト見積もり詳細 (${model}モデル)

- **総サブタスク数**: ${result.subTasks.length} 件
- **総入力トークン**: ${totalInputTokens.toLocaleString()} トークン
- **総出力トークン（予測）**: ${totalOutputTokens.toLocaleString()} トークン
  - (1タスクあたり ${averageOutputTokens} トークンで計算)

---
- **入力料金**: ${inputCost.toFixed(3)} 円
- **出力料金**: ${outputCost.toFixed(3)} 円
- **合計予測コスト**: **${totalCost.toFixed(3)} 円**
---
- **推定作業時間**: ${result.estimatedTime}
`

    return {
      model,
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      subTaskCount: result.subTasks.length,
      estimatedTime: result.estimatedTime,
      costDetails,
    }
  }

  // --- ここまで追加 ---


  /**
   * タスクファイルを生成
   */
  generateTaskFiles(result: TaskSplitResult): string[] {
    const files: string[] = []
    
    result.subTasks.forEach(task => {
      const content = this.generateTaskFileContent(task)
      // 実際のファイル書き込みは呼び出し側で行う
      files.push(`${this.config.tasksDir}/${task.file}`)
      console.log(`Generated: ${task.file}`)
    })
    
    return files
  }

  /**
   * タスクファイルの内容を生成
   */
  private generateTaskFileContent(task: EnkaiTask): string {
    return `# Enkai タスク: ${task.id}

## タスク概要
${task.instructions}

## タスクタイプ
${task.taskType}

## 優先度
${task.priority}

## 期待される結果
${task.expectedResult}

## 実装手順
1. このファイルの内容を確認
2. 指定されたタスクを実行
3. AI-First原則に従って実装
   - 完全自己完結型で実装
   - 外部依存は最小限に
   - 重複コードは問題なし
4. 完了後、ステータスを更新

## 注意事項
- 他のタスクと並列実行されています
- ファイルの競合を避けるため、指定されたファイルのみを編集してください
- 完了したら必ずコミットしてください

---
ステータス: ${task.status}
作成日時: ${task.createdAt?.toLocaleString('ja-JP')}
`
  }

  /**
   * タスクステータスを更新
   */
  updateTaskStatus(taskId: string, status: EnkaiTask['status'], assignedTo?: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = status
      if (assignedTo) task.assignedTo = assignedTo
      if (status === 'completed') task.completedAt = new Date()
    }
  }

  /**
   * タスクサマリーを取得
   */
  getTaskSummary(): TaskSummary {
    const tasks = Array.from(this.tasks.values())
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      assigned: tasks.filter(t => t.status === 'assigned').length
    }
  }

  /**
   * 実行手順の生成
   */
  generateExecutionInstructions(result: TaskSplitResult): string {
    return `
# Enkai（宴会）並列実行手順

## 準備
1. ${result.totalFiles}個の新しいClaude窓を開く
2. 各窓に以下のタスクファイルを割り当てる：
${result.subTasks.map(task => `   - Claude-${task.id.split('-').pop()}: ${task.file}`).join('\n')}

## 実行
1. 各Claudeに対応するタスクファイルの内容をコピー
2. 同時に実行開始（まさに宴会のように賑やかに！）
3. 完了したものから順次コミット

## マージ
1. 全タスク完了後、mainブランチにマージ
2. コンフリクトは発生しないはず（ファイル独立のため）

推定完了時間: ${result.estimatedTime}
`
  }

  /**
   * 進捗レポートの生成
   */
  generateProgressReport(): string {
    const summary = this.getTaskSummary()
    const progressPercentage = summary.total > 0 
      ? Math.round((summary.completed / summary.total) * 100)
      : 0
    
    return `
# Enkai 進捗レポート

## 全体進捗: ${progressPercentage}%

## タスク状況
- 総タスク数: ${summary.total}
- 完了: ${summary.completed} ✅
- 進行中: ${summary.assigned} 🔄
- 待機中: ${summary.pending} ⏳

## 推定残り時間
約${summary.pending * 10}分（待機中タスク × 10分/タスク）

生成日時: ${new Date().toLocaleString('ja-JP')}
`
  }

  /**
   * 複雑なタスクを実行
   */
  async executeComplexTask(description: string, options?: {
    targetFiles?: string[]
    autoGenerate?: boolean
  }): Promise<{
    result: TaskSplitResult
    files: string[]
    instructions: string
  }> {
    // タスクを分割
    const result = this.analyzeAndSplitTask(description, options?.targetFiles)
    
    // ファイルを生成
    const files = options?.autoGenerate !== false 
      ? this.generateTaskFiles(result)
      : []
    
    // 実行手順を生成
    const instructions = this.generateExecutionInstructions(result)
    
    return { result, files, instructions }
  }

  /**
   * タスクのクリーンアップ
   */
  cleanup(): void {
    this.tasks.clear()
  }
}

// デフォルトエクスポート
export default Enkai