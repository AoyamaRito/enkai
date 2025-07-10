#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import pLimit from 'p-limit';
import * as path from 'path';

// タスク定義型
interface Task {
  fileName: string;
  prompt: string;
  outputPath: string;
}

// 実行結果型
interface TaskResult {
  success: boolean;
  fileName: string;
  outputPath: string;
  duration: number;
  error?: any;
}

// AI-First base prompt
const AI_FIRST_BASE_PROMPT = `
# AI-First Development Principles

Follow these implementation guidelines:

1. **Complete Self-Containment**
   - 1 file = 1 complete feature
   - Minimal external imports (React/Next.js standard only)
   - No custom hooks - implement as in-file functions
   - No external atoms - use in-file useState/useReducer
   - No utils functions - copy needed functions to each file

2. **Tech Stack**
   - React/Next.js App Router
   - TypeScript
   - useState/useReducer for state management
   - Inline styles + Tailwind CSS
   - Direct fetch for API calls

3. **Implementation Rules**
   - No comments (self-documenting code)
   - Mobile-first approach
   - Complete error handling
   - Loading states implementation

4. **Forbidden**
   - Jotai/Recoil or external state management
   - Custom hooks
   - Shared utils/lib
   - CSS Modules

Component to implement:
`;

// Gemini parallel execution function
async function executeParallel(tasks: Task[], concurrency: number = 5) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  // 並列実行数を制限
  const limit = pLimit(concurrency);
  
  const startTime = Date.now();
  console.log(chalk.blue(`🚀 Executing ${tasks.length} tasks in parallel (concurrency: ${concurrency})...\n`));

  const promises = tasks.map((task) => 
    limit(async () => {
      const taskSpinner = ora(`${task.fileName} generating...`).start();
      const taskStartTime = Date.now();
      
      try {
        // AI-First原則を必ず追加
        const fullPrompt = `${AI_FIRST_BASE_PROMPT}\n\n${task.prompt}`;
        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();
        
        // コードブロックを抽出
        const codeMatch = response.match(/```(?:typescript|tsx|ts|jsx|js)?\n([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[1] : response;
        
        // ディレクトリ作成
        const dir = path.dirname(task.outputPath);
        await fs.mkdir(dir, { recursive: true });
        
        // Write file
        await fs.writeFile(task.outputPath, code.trim());
        
        const duration = Date.now() - taskStartTime;
        taskSpinner.succeed(chalk.green(`✓ ${task.fileName} completed (${duration}ms)`));
        
        return { 
          success: true, 
          fileName: task.fileName, 
          outputPath: task.outputPath,
          duration 
        };
      } catch (error) {
        const duration = Date.now() - taskStartTime;
        taskSpinner.fail(chalk.red(`✗ ${task.fileName} failed`));
        console.error(chalk.gray(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        
        return { 
          success: false, 
          fileName: task.fileName, 
          outputPath: task.outputPath,
          duration,
          error 
        };
      }
    })
  );

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;
  
  // 結果サマリー
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(chalk.blue(`\n📊 Execution Results:`));
  console.log(chalk.green(`  Success: ${successCount} files`));
  if (failCount > 0) {
    console.log(chalk.red(`  Failed: ${failCount} files`));
  }
  console.log(chalk.gray(`  Total time: ${totalDuration}ms`));
  console.log(chalk.gray(`  Average: ${Math.round(totalDuration / tasks.length)}ms/file`));
  
  // レポート生成
  await generateReport(results, totalDuration);
  
  return results;
}

// Report generation function
async function generateReport(results: TaskResult[], totalDuration: number) {
  const report = {
    timestamp: new Date().toISOString(),
    totalDuration,
    totalTasks: results.length,
    successCount: results.filter(r => r.success).length,
    failCount: results.filter(r => !r.success).length,
    averageDuration: Math.round(totalDuration / results.length),
    tasks: results.map(r => ({
      fileName: r.fileName,
      outputPath: r.outputPath,
      success: r.success,
      duration: r.duration,
      error: r.error ? String(r.error) : undefined
    }))
  };
  
  const reportPath = `./gemini-report-${Date.now()}.json`;
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(chalk.gray(`\n📄 Detailed report: ${reportPath}`));
}

// タスクテンプレート読み込み
async function loadTaskTemplate(templateName: string): Promise<Task[]> {
  const templatePath = `./templates/${templateName}.json`;
  try {
    const content = await fs.readFile(templatePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`テンプレート読み込みエラー: ${templatePath}`));
    throw error;
  }
}

// CLIコマンド定義
const program = new Command();

program
  .name('gemini-parallel')
  .description('Parallel code generation tool using Gemini API')
  .version('1.0.0');

// ゲームコンポーネント生成コマンド
program
  .command('create-game-components')
  .description('Generate game components in parallel')
  .option('-c, --concurrency <number>', 'Concurrency level', '5')
  .action(async (options) => {
    const concurrency = parseInt(options.concurrency);
    
    const tasks: Task[] = [
      {
        fileName: 'GameChat.tsx',
        outputPath: './components/GameChat.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

GameChat.tsx
- Real-time chat with NPCs
- Message history (user/NPC distinction)
- Auto-scroll
- Input form (Enter to send)
- Disable input while loading
- Avatar display for each message
- Timestamp display
- Mobile responsive layout`
      },
      {
        fileName: 'PlayerProfile.tsx',
        outputPath: './components/PlayerProfile.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

PlayerProfile.tsx
- Player basic info (name, level, experience)
- Status display (HP/MP/Attack/Defense)
- Equipment item list
- Skill list
- Profile image upload
- Status point allocation
- Level up animation
- Mobile responsive card UI`
      },
      {
        fileName: 'ItemInventory.tsx',
        outputPath: './components/ItemInventory.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

ItemInventory.tsx
- アイテムグリッド表示
- カテゴリフィルター（武器/防具/消耗品/その他）
- アイテム検索機能
- ドラッグ&ドロップで並び替え
- アイテム詳細モーダル
- 装備/使用/売却ボタン
- 所持数表示
- レアリティ表示（色分け）`
      },
      {
        fileName: 'BattleSystem.tsx',
        outputPath: './components/BattleSystem.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

BattleSystem.tsx
- ターン制バトルUI
- プレイヤー/敵のHP・MPバー
- アクション選択（攻撃/スキル/アイテム/逃走）
- ダメージ数値アニメーション
- バトルログ表示
- スキルエフェクト
- 勝利/敗北画面
- 獲得経験値・アイテム表示`
      },
      {
        fileName: 'QuestBoard.tsx',
        outputPath: './components/QuestBoard.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

QuestBoard.tsx
- クエスト一覧表示（進行中/完了/未着手）
- クエスト詳細情報
- 報酬プレビュー
- 進捗トラッキング
- クエスト受注/破棄機能
- 難易度表示（星評価）
- 期限付きクエストのカウントダウン
- フィルター/ソート機能`
      }
    ];

    await executeParallel(tasks, concurrency);
  });

// Webアプリコンポーネント生成コマンド
program
  .command('create-web-app')
  .description('Generate web app components in parallel')
  .option('-c, --concurrency <number>', 'Concurrency level', '5')
  .action(async (options) => {
    const concurrency = parseInt(options.concurrency);
    
    const tasks: Task[] = [
      {
        fileName: 'Dashboard.tsx',
        outputPath: './app/dashboard/page.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

Dashboard.tsx（Next.js App Router ページコンポーネント）
- 統計サマリーカード（売上/ユーザー数/アクティブ率）
- Real-time graphs (no Chart.js, implement with SVG)
- 最近のアクティビティフィード
- クイックアクションボタン
- 通知パネル
- レスポンシブグリッドレイアウト`
      },
      {
        fileName: 'UserSettings.tsx',
        outputPath: './app/settings/page.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

UserSettings.tsx（Next.js App Router ページコンポーネント）
- プロフィール編集フォーム
- パスワード変更
- 通知設定（メール/プッシュ/SMS）
- プライバシー設定
- 連携サービス管理
- アカウント削除機能
- 設定の自動保存`
      },
      {
        fileName: 'DataTable.tsx',
        outputPath: './components/DataTable.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

DataTable.tsx
- ソート可能なテーブルヘッダー
- ページネーション
- 行選択（チェックボックス）
- インライン編集
- CSVエクスポート機能
- カラム表示/非表示切り替え
- 検索フィルター
- モバイル対応（カード表示切り替え）`
      }
    ];

    await executeParallel(tasks, concurrency);
  });

// テンプレートからタスク実行
program
  .command('from-template <templateName>')
  .description('Execute tasks from template file')
  .option('-c, --concurrency <number>', 'Concurrency level', '5')
  .action(async (templateName, options) => {
    const concurrency = parseInt(options.concurrency);
    
    try {
      const tasks = await loadTaskTemplate(templateName);
      await executeParallel(tasks, concurrency);
    } catch (error) {
      console.error(chalk.red('Template execution error'));
      process.exit(1);
    }
  });

// カスタムタスク実行
program
  .command('custom')
  .description('カスタムタスクを対話的に作成して実行')
  .option('-c, --concurrency <number>', 'Concurrency level', '5')
  .action(async (options) => {
    // Simple implementation (interactive input to be implemented)
    console.log(chalk.yellow('カスタムタスク機能は開発中です...'));
  });

// 環境変数チェック
if (!process.env.GEMINI_API_KEY) {
  console.error(chalk.red('エラー: GEMINI_API_KEY環境変数が設定されていません'));
  console.log(chalk.gray('Please run: export GEMINI_API_KEY="your-api-key"'));
  process.exit(1);
}

program.parse();