#!/usr/bin/env node

/**
 * 高度なGemini並列実行ツール - タスクに応じて最適なモデルを選択
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import pLimit from 'p-limit';
import * as path from 'path';

// タスク定義型（モデル選択機能付き）
interface AdvancedTask {
  fileName: string;
  prompt: string;
  outputPath: string;
  model?: 'flash' | 'thinking' | 'pro';  // モデル選択
  complexity?: 'simple' | 'medium' | 'complex';  // 複雑度
}

// モデルマッピング
const MODEL_MAP = {
  'flash': 'gemini-2.0-flash',
  'thinking': 'gemini-2.0-flash-thinking-exp-1219',  // 最新版
  'pro': 'gemini-1.5-pro'
} as const;

// タスクの複雑度に基づいてモデルを自動選択
function selectOptimalModel(task: AdvancedTask): string {
  // 明示的にモデルが指定されている場合
  if (task.model) {
    return MODEL_MAP[task.model];
  }
  
  // 複雑度に基づく自動選択
  if (task.complexity === 'complex') {
    return MODEL_MAP.thinking;  // 複雑なタスクはthinking
  } else if (task.complexity === 'medium') {
    return MODEL_MAP.flash;     // 中程度はflash
  } else {
    return MODEL_MAP.flash;     // シンプルなタスクもflash
  }
}

// 複雑度を自動判定
function analyzeComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
  const complexKeywords = [
    'アーキテクチャ', 'architecture',
    'アルゴリズム', 'algorithm',
    'ステートマシン', 'state machine',
    '複雑な', 'complex',
    'システム設計', 'system design',
    'データ構造', 'data structure',
    '最適化', 'optimization'
  ];
  
  const mediumKeywords = [
    'フォーム', 'form',
    'API', 'endpoint',
    'CRUD',
    'バリデーション', 'validation',
    'コンポーネント', 'component'
  ];
  
  const promptLower = prompt.toLowerCase();
  
  // 複雑度判定
  const hasComplexKeywords = complexKeywords.some(keyword => 
    promptLower.includes(keyword.toLowerCase())
  );
  
  const hasMediumKeywords = mediumKeywords.some(keyword => 
    promptLower.includes(keyword.toLowerCase())
  );
  
  if (hasComplexKeywords || prompt.length > 500) {
    return 'complex';
  } else if (hasMediumKeywords || prompt.length > 200) {
    return 'medium';
  } else {
    return 'simple';
  }
}

// 高度な並列実行関数
async function executeAdvancedParallel(tasks: AdvancedTask[], options: {
  flashConcurrency?: number;
  thinkingConcurrency?: number;
  verbose?: boolean;
} = {}) {
  const {
    flashConcurrency = 5,      // Flash系は5並列
    thinkingConcurrency = 2,   // Thinking系は2並列（重いため）
    verbose = true
  } = options;
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  // タスクをモデル別に分類
  const tasksByModel = new Map<string, AdvancedTask[]>();
  
  for (const task of tasks) {
    // 複雑度が未設定の場合は自動判定
    if (!task.complexity) {
      task.complexity = analyzeComplexity(task.prompt);
    }
    
    const model = selectOptimalModel(task);
    const modelTasks = tasksByModel.get(model) || [];
    modelTasks.push(task);
    tasksByModel.set(model, modelTasks);
  }
  
  if (verbose) {
    console.log(chalk.blue('\n📊 タスク分析結果:'));
    for (const [model, modelTasks] of tasksByModel) {
      console.log(chalk.cyan(`  ${model}: ${modelTasks.length}タスク`));
      modelTasks.forEach(task => {
        console.log(chalk.gray(`    - ${task.fileName} (${task.complexity})`));
      });
    }
    console.log();
  }
  
  const startTime = Date.now();
  const allResults: any[] = [];
  
  // モデルごとに並列実行
  for (const [modelName, modelTasks] of tasksByModel) {
    const model = genAI.getGenerativeModel({ model: modelName });
    const concurrency = modelName.includes('thinking') ? thinkingConcurrency : flashConcurrency;
    
    console.log(chalk.blue(`\n🚀 ${modelName} で${modelTasks.length}タスクを実行中...`));
    
    const limit = pLimit(concurrency);
    
    const promises = modelTasks.map((task) => 
      limit(async () => {
        const taskSpinner = ora(`${task.fileName} 生成中... (${modelName})`).start();
        const taskStartTime = Date.now();
        
        try {
          const result = await model.generateContent(task.prompt);
          const response = result.response.text();
          
          // コードブロックを抽出
          const codeMatch = response.match(/```(?:typescript|tsx|ts|jsx|js)?\n([\s\S]*?)```/);
          const code = codeMatch ? codeMatch[1] : response;
          
          // ディレクトリ作成
          const dir = path.dirname(task.outputPath);
          await fs.mkdir(dir, { recursive: true });
          
          // ファイル書き込み
          await fs.writeFile(task.outputPath, code.trim());
          
          const duration = Date.now() - taskStartTime;
          taskSpinner.succeed(chalk.green(`✓ ${task.fileName} 完了 (${duration}ms) [${task.complexity}]`));
          
          return {
            success: true,
            fileName: task.fileName,
            outputPath: task.outputPath,
            duration,
            model: modelName,
            complexity: task.complexity
          };
        } catch (error) {
          const duration = Date.now() - taskStartTime;
          taskSpinner.fail(chalk.red(`✗ ${task.fileName} 失敗`));
          
          return {
            success: false,
            fileName: task.fileName,
            outputPath: task.outputPath,
            duration,
            model: modelName,
            complexity: task.complexity,
            error
          };
        }
      })
    );
    
    const results = await Promise.all(promises);
    allResults.push(...results);
  }
  
  const totalDuration = Date.now() - startTime;
  
  // 結果サマリー
  console.log(chalk.blue('\n📊 実行結果サマリー:'));
  console.log(chalk.green(`  総実行時間: ${totalDuration}ms`));
  console.log(chalk.cyan(`  平均時間: ${Math.round(totalDuration / tasks.length)}ms/タスク`));
  
  // モデル別統計
  const modelStats = new Map<string, { count: number; totalTime: number }>();
  
  allResults.forEach(result => {
    const stats = modelStats.get(result.model) || { count: 0, totalTime: 0 };
    stats.count++;
    stats.totalTime += result.duration;
    modelStats.set(result.model, stats);
  });
  
  console.log(chalk.blue('\n📈 モデル別パフォーマンス:'));
  for (const [model, stats] of modelStats) {
    const avgTime = Math.round(stats.totalTime / stats.count);
    console.log(chalk.cyan(`  ${model}:`));
    console.log(chalk.gray(`    - タスク数: ${stats.count}`));
    console.log(chalk.gray(`    - 平均時間: ${avgTime}ms`));
  }
  
  return allResults;
}

// CLIコマンド定義
const program = new Command();

program
  .name('gemini-parallel-advanced')
  .description('タスクに応じて最適なGeminiモデルを選択する高度な並列実行ツール')
  .version('2.0.0');

// スマート実行コマンド
program
  .command('smart-execute')
  .description('タスクの複雑度を自動判定して最適なモデルで実行')
  .action(async () => {
    const tasks: AdvancedTask[] = [
      {
        fileName: 'SimpleButton.tsx',
        outputPath: './components/SimpleButton.tsx',
        prompt: 'シンプルなボタンコンポーネントを作成。クリックイベント付き。'
        // complexity: 自動判定される → 'simple'
      },
      {
        fileName: 'ComplexForm.tsx',
        outputPath: './components/ComplexForm.tsx',
        prompt: `
複雑なフォームコンポーネントを作成:
- マルチステップフォーム（3ステップ）
- 各ステップでバリデーション
- 進捗インジケーター
- データの永続化（localStorage）
- アニメーション付きの画面遷移
- エラーハンドリングとリトライ機能
- フォームデータのプレビュー機能
        `
        // complexity: 自動判定される → 'complex'
      },
      {
        fileName: 'DataTable.tsx',
        outputPath: './components/DataTable.tsx',
        prompt: 'データテーブルコンポーネント。ソート、フィルター、ページネーション機能付き。'
        // complexity: 自動判定される → 'medium'
      },
      {
        fileName: 'StateManager.ts',
        outputPath: './utils/StateManager.ts',
        prompt: `
高度な状態管理システムの実装:
- Redux風のアーキテクチャ
- ミドルウェアサポート
- 時間旅行デバッグ機能
- 非同期アクション対応
- TypeScript完全型付け
- パフォーマンス最適化（メモ化）
        `,
        model: 'thinking'  // 明示的にthinkingモデルを指定
      }
    ];
    
    await executeAdvancedParallel(tasks, {
      flashConcurrency: 5,
      thinkingConcurrency: 2,
      verbose: true
    });
  });

// 比較テストコマンド
program
  .command('compare-models')
  .description('同じタスクを異なるモデルで実行して比較')
  .action(async () => {
    const testPrompt = `
Reactコンポーネントを作成:
- ToDoリストアプリケーション
- 追加、編集、削除、完了機能
- フィルター機能（全て、完了、未完了）
- ローカルストレージ保存
- ドラッグ&ドロップで並び替え
    `;
    
    const models: Array<'flash' | 'thinking'> = ['flash', 'thinking'];
    const results: any[] = [];
    
    for (const model of models) {
      const task: AdvancedTask = {
        fileName: `TodoApp_${model}.tsx`,
        outputPath: `./comparison/TodoApp_${model}.tsx`,
        prompt: testPrompt,
        model: model
      };
      
      console.log(chalk.blue(`\n${MODEL_MAP[model]}でテスト中...`));
      const startTime = Date.now();
      
      await executeAdvancedParallel([task], {
        verbose: false
      });
      
      const duration = Date.now() - startTime;
      results.push({ model: MODEL_MAP[model], duration });
    }
    
    console.log(chalk.blue('\n📊 モデル比較結果:'));
    results.forEach(result => {
      console.log(chalk.cyan(`${result.model}: ${result.duration}ms`));
    });
  });

// 環境変数チェック
if (!process.env.GEMINI_API_KEY) {
  console.error(chalk.red('エラー: GEMINI_API_KEY環境変数が設定されていません'));
  process.exit(1);
}

program.parse();