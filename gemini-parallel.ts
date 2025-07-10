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

// AI-Firstプロンプトベース
const AI_FIRST_BASE_PROMPT = `
# AI-First開発原則に従った実装

以下の方針で実装してください：

1. **完全自己完結原則**
   - 1ファイル = 1つの完全な機能
   - 外部インポートは絶対最小限（React/Next.js標準のみ）
   - カスタムhooks禁止 → ファイル内関数として実装
   - 外部atoms禁止 → ファイル内useState/useReducer
   - utils関数禁止 → 必要な関数は各ファイルにコピー

2. **技術スタック**
   - React/Next.js App Router
   - TypeScript
   - useState/useReducer（状態管理）
   - インラインスタイル + Tailwind CSS
   - fetch直書き（API通信）

3. **実装ルール**
   - 日本語コメントなし（コードで自己説明）
   - モバイルファースト
   - エラーハンドリング完備
   - ローディング状態実装

4. **禁止事項**
   - Jotai/Recoil等の外部状態管理
   - カスタムhooks
   - 共有utils/lib
   - CSS Modules

実装するコンポーネント：
`;

// Gemini並列実行関数
async function executeParallel(tasks: Task[], concurrency: number = 5) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  // 並列実行数を制限
  const limit = pLimit(concurrency);
  
  const startTime = Date.now();
  console.log(chalk.blue(`🚀 ${tasks.length}個のタスクを並列実行中（並列数: ${concurrency}）...\n`));

  const promises = tasks.map((task) => 
    limit(async () => {
      const taskSpinner = ora(`${task.fileName} 生成中...`).start();
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
        
        // ファイル書き込み
        await fs.writeFile(task.outputPath, code.trim());
        
        const duration = Date.now() - taskStartTime;
        taskSpinner.succeed(chalk.green(`✓ ${task.fileName} 完了 (${duration}ms)`));
        
        return { 
          success: true, 
          fileName: task.fileName, 
          outputPath: task.outputPath,
          duration 
        };
      } catch (error) {
        const duration = Date.now() - taskStartTime;
        taskSpinner.fail(chalk.red(`✗ ${task.fileName} 失敗`));
        console.error(chalk.gray(`  エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
        
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
  
  console.log(chalk.blue(`\n📊 実行結果:`));
  console.log(chalk.green(`  成功: ${successCount}ファイル`));
  if (failCount > 0) {
    console.log(chalk.red(`  失敗: ${failCount}ファイル`));
  }
  console.log(chalk.gray(`  総実行時間: ${totalDuration}ms`));
  console.log(chalk.gray(`  平均実行時間: ${Math.round(totalDuration / tasks.length)}ms/ファイル`));
  
  // レポート生成
  await generateReport(results, totalDuration);
  
  return results;
}

// レポート生成関数
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
  console.log(chalk.gray(`\n📄 詳細レポート: ${reportPath}`));
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
  .description('Gemini APIを使用した並列コード生成ツール')
  .version('1.0.0');

// ゲームコンポーネント生成コマンド
program
  .command('create-game-components')
  .description('ゲームコンポーネントを並列生成')
  .option('-c, --concurrency <number>', '並列実行数', '5')
  .action(async (options) => {
    const concurrency = parseInt(options.concurrency);
    
    const tasks: Task[] = [
      {
        fileName: 'GameChat.tsx',
        outputPath: './components/GameChat.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

GameChat.tsx
- NPCとのリアルタイムチャット機能
- メッセージ履歴（ユーザー/NPC区別）
- 自動スクロール
- 入力フォーム（Enter送信対応）
- ローディング中は入力無効化
- メッセージごとにアバター表示
- タイムスタンプ表示
- モバイル対応レイアウト`
      },
      {
        fileName: 'PlayerProfile.tsx',
        outputPath: './components/PlayerProfile.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

PlayerProfile.tsx
- プレイヤー基本情報（名前、レベル、経験値）
- ステータス表示（HP/MP/攻撃力/防御力）
- 装備アイテム一覧
- スキルリスト
- プロフィール画像アップロード
- ステータスポイント振り分け機能
- レベルアップ時のアニメーション
- モバイル対応カード型UI`
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
  .description('Webアプリケーションコンポーネントを並列生成')
  .option('-c, --concurrency <number>', '並列実行数', '5')
  .action(async (options) => {
    const concurrency = parseInt(options.concurrency);
    
    const tasks: Task[] = [
      {
        fileName: 'Dashboard.tsx',
        outputPath: './app/dashboard/page.tsx',
        prompt: `${AI_FIRST_BASE_PROMPT}

Dashboard.tsx（Next.js App Router ページコンポーネント）
- 統計サマリーカード（売上/ユーザー数/アクティブ率）
- リアルタイムグラフ（Chart.js不要、SVGで実装）
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
  .description('テンプレートファイルからタスクを実行')
  .option('-c, --concurrency <number>', '並列実行数', '5')
  .action(async (templateName, options) => {
    const concurrency = parseInt(options.concurrency);
    
    try {
      const tasks = await loadTaskTemplate(templateName);
      await executeParallel(tasks, concurrency);
    } catch (error) {
      console.error(chalk.red('テンプレート実行エラー'));
      process.exit(1);
    }
  });

// カスタムタスク実行
program
  .command('custom')
  .description('カスタムタスクを対話的に作成して実行')
  .option('-c, --concurrency <number>', '並列実行数', '5')
  .action(async (options) => {
    // 簡易実装（本来は対話的入力を実装）
    console.log(chalk.yellow('カスタムタスク機能は開発中です...'));
  });

// 環境変数チェック
if (!process.env.GEMINI_API_KEY) {
  console.error(chalk.red('エラー: GEMINI_API_KEY環境変数が設定されていません'));
  console.log(chalk.gray('export GEMINI_API_KEY="your-api-key" を実行してください'));
  process.exit(1);
}

program.parse();