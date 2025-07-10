#!/usr/bin/env node

/**
 * Claude Code内から直接実行可能なGemini並列実行関数
 * 
 * 使用例:
 * ```typescript
 * import { executeGeminiTasks } from './gemini-execute';
 * 
 * const tasks = [
 *   { fileName: 'Component.tsx', outputPath: './Component.tsx', prompt: '...' }
 * ];
 * 
 * await executeGeminiTasks(tasks);
 * ```
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import * as path from 'path';

// タスク定義型
export interface GeminiTask {
  fileName: string;
  prompt: string;
  outputPath: string;
}

// 実行結果型
export interface GeminiResult {
  success: boolean;
  fileName: string;
  outputPath: string;
  duration: number;
  error?: any;
}

// 実行オプション
export interface ExecuteOptions {
  apiKey?: string;
  concurrency?: number;
  verbose?: boolean;
  basePrompt?: string;
  model?: string;
}

/**
 * 簡易並列実行関数（p-limit不要版）
 */
async function runParallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (const task of tasks) {
    const promise = task().then(result => {
      results.push(result);
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

/**
 * Geminiタスクを並列実行
 */
export async function executeGeminiTasks(
  tasks: GeminiTask[],
  options: ExecuteOptions = {}
): Promise<GeminiResult[]> {
  const {
    apiKey = process.env.GEMINI_API_KEY,
    concurrency = 5,
    verbose = true,
    basePrompt = '',
    model = 'gemini-2.0-flash'
  } = options;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  if (verbose) {
    console.log(`🚀 Executing ${tasks.length} tasks with concurrency ${concurrency}...`);
  }

  const startTime = Date.now();

  // タスクを関数配列に変換
  const taskFunctions = tasks.map(task => async (): Promise<GeminiResult> => {
    const taskStartTime = Date.now();
    
    try {
      if (verbose) {
        console.log(`⏳ Processing ${task.fileName}...`);
      }

      // プロンプト結合
      const fullPrompt = basePrompt ? `${basePrompt}\n\n${task.prompt}` : task.prompt;
      
      // Gemini API呼び出し
      const result = await geminiModel.generateContent(fullPrompt);
      const response = result.response.text();
      
      // コードブロック抽出
      const codeMatch = response.match(/```(?:typescript|tsx|ts|jsx|js|python|py|go|java|cpp|c)?\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1] : response;
      
      // ディレクトリ作成
      const dir = path.dirname(task.outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      // ファイル書き込み
      await fs.writeFile(task.outputPath, code.trim());
      
      const duration = Date.now() - taskStartTime;
      
      if (verbose) {
        console.log(`✅ ${task.fileName} completed (${duration}ms)`);
      }
      
      return {
        success: true,
        fileName: task.fileName,
        outputPath: task.outputPath,
        duration
      };
    } catch (error) {
      const duration = Date.now() - taskStartTime;
      
      if (verbose) {
        console.error(`❌ ${task.fileName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      return {
        success: false,
        fileName: task.fileName,
        outputPath: task.outputPath,
        duration,
        error
      };
    }
  });

  // 並列実行
  const results = await runParallel(taskFunctions, concurrency);
  
  const totalDuration = Date.now() - startTime;
  
  if (verbose) {
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log('\n📊 Execution Summary:');
    console.log(`  ✅ Success: ${successCount}`);
    if (failCount > 0) {
      console.log(`  ❌ Failed: ${failCount}`);
    }
    console.log(`  ⏱️  Total time: ${totalDuration}ms`);
    console.log(`  ⚡ Average: ${Math.round(totalDuration / tasks.length)}ms per task`);
  }
  
  return results;
}

/**
 * Claude Code用の簡易実行関数
 */
export async function quickExecute(
  taskDefinitions: Array<{ name: string; description: string }>,
  options: ExecuteOptions = {}
): Promise<GeminiResult[]> {
  const tasks: GeminiTask[] = taskDefinitions.map(def => ({
    fileName: def.name,
    outputPath: `./${def.name}`,
    prompt: def.description
  }));
  
  return executeGeminiTasks(tasks, options);
}

/**
 * AI-First開発用のプリセット実行関数
 */
export async function executeAIFirstComponents(
  components: Array<{ name: string; spec: string }>,
  outputDir: string = './components'
): Promise<GeminiResult[]> {
  const basePrompt = `
# AI-First開発原則に従った実装

以下の方針で実装してください：

1. **完全自己完結原則**
   - 1ファイル = 1つの完全な機能
   - 外部インポートは絶対最小限（React/Next.js標準のみ）
   - カスタムhooks禁止 → ファイル内関数として実装
   - 外部atoms禁止 → ファイル内useState/useReducer

2. **技術スタック**
   - React/Next.js App Router
   - TypeScript
   - useState/useReducer（状態管理）
   - インラインスタイル + Tailwind CSS
   - fetch直書き（API通信）

3. **実装ルール**
   - 日本語コメントなし
   - モバイルファースト
   - エラーハンドリング完備
   - ローディング状態実装

実装するコンポーネント：`;

  const tasks: GeminiTask[] = components.map(comp => ({
    fileName: comp.name,
    outputPath: path.join(outputDir, comp.name),
    prompt: comp.spec
  }));

  return executeGeminiTasks(tasks, { basePrompt, ...options });
}

// CLI実行の場合
if (require.main === module) {
  // 簡易CLIモード
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: 
  npx tsx gemini-execute.ts <task1> <task2> ...
  
Example:
  npx tsx gemini-execute.ts "GameChat.tsx:Create a chat component" "Profile.tsx:Create a profile component"
    `);
    process.exit(0);
  }

  const tasks: GeminiTask[] = args.map(arg => {
    const [fileName, ...promptParts] = arg.split(':');
    return {
      fileName,
      outputPath: `./${fileName}`,
      prompt: promptParts.join(':')
    };
  });

  executeGeminiTasks(tasks).catch(console.error);
}