#!/usr/bin/env node

/**
 * ローカルAPIキー管理ツール
 * 複数のAPIキーを安全に管理・切り替え
 */

import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';

// APIキー保存先
const CONFIG_DIR = path.join(os.homedir(), '.api-keys');
const CONFIG_FILE = path.join(CONFIG_DIR, 'keys.json');
const ENV_FILE = path.join(process.cwd(), '.env');

// 暗号化設定
const ALGORITHM = 'aes-256-cbc';
const SALT = 'api-key-manager-salt';

interface ApiKey {
  name: string;
  key: string;
  service: string;
  createdAt: string;
  lastUsed?: string;
  description?: string;
}

interface Config {
  keys: ApiKey[];
  encryptionKey?: string;
}

// 暗号化キー生成
function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 暗号化
function encrypt(text: string, encryptionKey: string): string {
  const key = crypto.scryptSync(encryptionKey, SALT, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// 復号化
function decrypt(encrypted: string, encryptionKey: string): string {
  const [ivHex, encryptedText] = encrypted.split(':');
  const key = crypto.scryptSync(encryptionKey, SALT, 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// 設定読み込み
async function loadConfig(): Promise<Config> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    const encryptionKey = generateEncryptionKey();
    const config: Config = { keys: [], encryptionKey };
    await saveConfig(config);
    return config;
  }
}

// 設定保存
async function saveConfig(config: Config): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// APIキー追加
async function addApiKey(
  name: string,
  key: string,
  service: string,
  description?: string
): Promise<void> {
  const config = await loadConfig();
  
  // 既存チェック
  if (config.keys.find(k => k.name === name)) {
    throw new Error(`APIキー '${name}' は既に存在します`);
  }
  
  // 暗号化して保存
  const encryptedKey = encrypt(key, config.encryptionKey!);
  
  config.keys.push({
    name,
    key: encryptedKey,
    service,
    createdAt: new Date().toISOString(),
    description
  });
  
  await saveConfig(config);
  console.log(chalk.green(`✅ APIキー '${name}' を追加しました`));
}

// APIキー一覧
async function listApiKeys(): Promise<void> {
  const config = await loadConfig();
  
  if (config.keys.length === 0) {
    console.log(chalk.yellow('保存されているAPIキーはありません'));
    return;
  }
  
  console.log(chalk.blue('\n🔑 保存されているAPIキー:\n'));
  
  config.keys.forEach((key, index) => {
    console.log(chalk.cyan(`${index + 1}. ${key.name}`));
    console.log(chalk.gray(`   サービス: ${key.service}`));
    if (key.description) {
      console.log(chalk.gray(`   説明: ${key.description}`));
    }
    console.log(chalk.gray(`   作成日: ${new Date(key.createdAt).toLocaleDateString()}`));
    if (key.lastUsed) {
      console.log(chalk.gray(`   最終使用: ${new Date(key.lastUsed).toLocaleDateString()}`));
    }
    console.log();
  });
}

// APIキー取得
async function getApiKey(name: string): Promise<string | null> {
  const config = await loadConfig();
  const apiKey = config.keys.find(k => k.name === name);
  
  if (!apiKey) {
    return null;
  }
  
  // 復号化
  const decryptedKey = decrypt(apiKey.key, config.encryptionKey!);
  
  // 最終使用日更新
  apiKey.lastUsed = new Date().toISOString();
  await saveConfig(config);
  
  return decryptedKey;
}

// 環境変数にエクスポート
async function exportToEnv(name: string, envVarName: string): Promise<void> {
  const key = await getApiKey(name);
  
  if (!key) {
    throw new Error(`APIキー '${name}' が見つかりません`);
  }
  
  // .envファイルの内容を読み込み
  let envContent = '';
  try {
    envContent = await fs.readFile(ENV_FILE, 'utf8');
  } catch {
    // ファイルが存在しない場合は新規作成
  }
  
  // 既存の値を更新または新規追加
  const lines = envContent.split('\n');
  const existingIndex = lines.findIndex(line => line.startsWith(`${envVarName}=`));
  
  if (existingIndex >= 0) {
    lines[existingIndex] = `${envVarName}=${key}`;
  } else {
    lines.push(`${envVarName}=${key}`);
  }
  
  // .envファイルに書き込み
  await fs.writeFile(ENV_FILE, lines.join('\n'));
  
  console.log(chalk.green(`✅ ${envVarName}を.envファイルに設定しました`));
}

// APIキー削除
async function removeApiKey(name: string): Promise<void> {
  const config = await loadConfig();
  const index = config.keys.findIndex(k => k.name === name);
  
  if (index === -1) {
    throw new Error(`APIキー '${name}' が見つかりません`);
  }
  
  config.keys.splice(index, 1);
  await saveConfig(config);
  
  console.log(chalk.green(`✅ APIキー '${name}' を削除しました`));
}

// 一括エクスポート
async function exportAll(): Promise<void> {
  const config = await loadConfig();
  const exports: string[] = [];
  
  for (const apiKey of config.keys) {
    const decryptedKey = decrypt(apiKey.key, config.encryptionKey!);
    const envVarName = `${apiKey.service.toUpperCase().replace(/-/g, '_')}_API_KEY`;
    exports.push(`${envVarName}=${decryptedKey}`);
  }
  
  if (exports.length === 0) {
    console.log(chalk.yellow('エクスポートするAPIキーがありません'));
    return;
  }
  
  // .envファイルに追記
  const envContent = exports.join('\n') + '\n';
  await fs.appendFile(ENV_FILE, envContent);
  
  console.log(chalk.green(`✅ ${exports.length}個のAPIキーを.envファイルにエクスポートしました`));
}

// シェルエクスポート用コマンド生成
async function generateShellExport(name: string): Promise<void> {
  const key = await getApiKey(name);
  
  if (!key) {
    throw new Error(`APIキー '${name}' が見つかりません`);
  }
  
  const config = await loadConfig();
  const apiKey = config.keys.find(k => k.name === name)!;
  const envVarName = `${apiKey.service.toUpperCase().replace(/-/g, '_')}_API_KEY`;
  
  console.log(chalk.blue('\n以下のコマンドを実行してください:'));
  console.log(chalk.cyan(`export ${envVarName}="${key}"`));
}

// CLI設定
const program = new Command();

program
  .name('api-key-manager')
  .description('ローカルAPIキー管理ツール')
  .version('1.0.0');

// add コマンド
program
  .command('add <name> <key> <service>')
  .description('新しいAPIキーを追加')
  .option('-d, --description <desc>', '説明を追加')
  .action(async (name, key, service, options) => {
    try {
      await addApiKey(name, key, service, options.description);
    } catch (error) {
      console.error(chalk.red(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// list コマンド
program
  .command('list')
  .alias('ls')
  .description('保存されているAPIキー一覧を表示')
  .action(async () => {
    try {
      await listApiKeys();
    } catch (error) {
      console.error(chalk.red(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// get コマンド
program
  .command('get <name>')
  .description('APIキーを取得（復号化）')
  .action(async (name) => {
    try {
      const key = await getApiKey(name);
      if (key) {
        console.log(chalk.green(`APIキー: ${key}`));
      } else {
        console.error(chalk.red(`APIキー '${name}' が見つかりません`));
      }
    } catch (error) {
      console.error(chalk.red(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// export コマンド
program
  .command('export <name> <envVarName>')
  .description('.envファイルにAPIキーをエクスポート')
  .action(async (name, envVarName) => {
    try {
      await exportToEnv(name, envVarName);
    } catch (error) {
      console.error(chalk.red(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// export-all コマンド
program
  .command('export-all')
  .description('すべてのAPIキーを.envファイルにエクスポート')
  .action(async () => {
    try {
      await exportAll();
    } catch (error) {
      console.error(chalk.red(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// shell コマンド
program
  .command('shell <name>')
  .description('シェルにエクスポートするコマンドを表示')
  .action(async (name) => {
    try {
      await generateShellExport(name);
    } catch (error) {
      console.error(chalk.red(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// remove コマンド
program
  .command('remove <name>')
  .alias('rm')
  .description('APIキーを削除')
  .action(async (name) => {
    try {
      await removeApiKey(name);
    } catch (error) {
      console.error(chalk.red(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// quick-setup コマンド（よく使うサービス用）
program
  .command('quick-setup')
  .description('一般的なAPIキーを対話的に設定')
  .action(async () => {
    console.log(chalk.blue('🚀 クイックセットアップ'));
    console.log(chalk.gray('Ctrl+Cでキャンセル\n'));
    
    const services = [
      { name: 'gemini', envVar: 'GEMINI_API_KEY', desc: 'Google Gemini AI' },
      { name: 'openai', envVar: 'OPENAI_API_KEY', desc: 'OpenAI GPT' },
      { name: 'anthropic', envVar: 'ANTHROPIC_API_KEY', desc: 'Anthropic Claude' },
      { name: 'github', envVar: 'GITHUB_TOKEN', desc: 'GitHub Personal Access Token' }
    ];
    
    for (const service of services) {
      console.log(chalk.cyan(`\n${service.desc}のAPIキーを設定しますか？ (y/N)`));
      // 実際の実装では対話的入力を追加
    }
  });

program.parse();