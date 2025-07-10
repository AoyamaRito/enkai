/**
 * Claude Code内で直接使用できるGemini並列実行の例
 */

import { executeGeminiTasks, executeAIFirstComponents, quickExecute } from './gemini-execute';

// 例1: 基本的な使い方
async function example1() {
  const tasks = [
    {
      fileName: 'Header.tsx',
      outputPath: './components/Header.tsx',
      prompt: 'Create a responsive header component with navigation menu'
    },
    {
      fileName: 'Footer.tsx',
      outputPath: './components/Footer.tsx',
      prompt: 'Create a footer component with social links and copyright'
    },
    {
      fileName: 'Card.tsx',
      outputPath: './components/Card.tsx',
      prompt: 'Create a reusable card component with image, title, and description'
    }
  ];

  const results = await executeGeminiTasks(tasks);
  console.log('Generated:', results.filter(r => r.success).length, 'files');
}

// 例2: AI-First開発用
async function example2() {
  const components = [
    {
      name: 'GameChat.tsx',
      spec: `
ゲームチャットコンポーネント
- NPCとのリアルタイムチャット
- メッセージ履歴管理
- 自動スクロール
- 入力フォーム（Enter送信）
- ローディング状態
- エラーハンドリング
      `
    },
    {
      name: 'PlayerInventory.tsx',
      spec: `
プレイヤーインベントリコンポーネント
- アイテムグリッド表示
- カテゴリフィルター
- アイテム検索
- ドラッグ&ドロップ
- アイテム詳細モーダル
- 使用/装備/売却機能
      `
    }
  ];

  const results = await executeAIFirstComponents(components);
  console.log('AI-First components generated:', results.length);
}

// 例3: クイック実行
async function example3() {
  const results = await quickExecute([
    { name: 'utils.ts', description: 'Create utility functions for date formatting and validation' },
    { name: 'types.ts', description: 'Create TypeScript interfaces for user, product, and order' },
    { name: 'api.ts', description: 'Create API client with fetch wrapper and error handling' }
  ]);
  
  console.log('Quick execution completed:', results);
}

// 例4: カスタムオプション付き
async function example4() {
  const tasks = [
    {
      fileName: 'Dashboard.tsx',
      outputPath: './pages/Dashboard.tsx',
      prompt: 'Create a dashboard with charts and statistics'
    }
  ];

  const results = await executeGeminiTasks(tasks, {
    concurrency: 10,              // 並列実行数を増やす
    verbose: true,                // 詳細ログ表示
    model: 'gemini-2.0-flash-exp', // モデル指定
    basePrompt: `
Use the following tech stack:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Recharts for charts
- No external state management
    `
  });
  
  console.log('Custom execution completed');
}

// 例5: Claude Code内での実践的な使い方
async function generateECommerceApp() {
  console.log('🛍️ Generating E-Commerce App Components...\n');

  // ステップ1: 基本コンポーネント
  const baseComponents = [
    { name: 'ProductList.tsx', spec: 'Product listing with grid layout, filters, and sorting' },
    { name: 'ProductDetail.tsx', spec: 'Product details page with images, reviews, and add to cart' },
    { name: 'ShoppingCart.tsx', spec: 'Shopping cart with quantity management and price calculation' },
    { name: 'Checkout.tsx', spec: 'Checkout flow with shipping and payment forms' }
  ];

  console.log('📦 Generating base components...');
  await executeAIFirstComponents(baseComponents, './components/shop');

  // ステップ2: 管理画面
  const adminComponents = [
    { name: 'AdminDashboard.tsx', spec: 'Admin dashboard with sales stats and recent orders' },
    { name: 'ProductManager.tsx', spec: 'Product CRUD interface with image upload' },
    { name: 'OrderManager.tsx', spec: 'Order management with status updates' }
  ];

  console.log('\n👨‍💼 Generating admin components...');
  await executeAIFirstComponents(adminComponents, './components/admin');

  // ステップ3: API routes
  const apiTasks = [
    {
      fileName: 'products/route.ts',
      outputPath: './app/api/products/route.ts',
      prompt: 'Next.js API route for product CRUD operations'
    },
    {
      fileName: 'orders/route.ts',
      outputPath: './app/api/orders/route.ts',
      prompt: 'Next.js API route for order management'
    },
    {
      fileName: 'auth/route.ts',
      outputPath: './app/api/auth/route.ts',
      prompt: 'Next.js API route for authentication with JWT'
    }
  ];

  console.log('\n🔌 Generating API routes...');
  await executeGeminiTasks(apiTasks);

  console.log('\n✅ E-Commerce app generation completed!');
}

// メイン実行（必要に応じてコメントアウト/アンコメント）
if (require.main === module) {
  // generateECommerceApp().catch(console.error);
}