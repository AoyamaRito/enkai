import Enkai from './enkai'; // パスを修正

// 1. Enkaiインスタンスを作成
const enkai = new Enkai();

// 2. 見積もりたいタスクの概要を定義
const taskDescription = `
Webアプリの基本的な認証機能を実装する。

対象ファイル：
- src/components/LoginForm.tsx (新規作成)
- src/components/SignupForm.tsx (新規作成)
- src/pages/api/auth/login.ts (新規作成)
- src/pages/api/auth/signup.ts (新規作成)
- src/lib/auth.ts (新規作成)
`;

const targetFiles = [
  'src/components/LoginForm.tsx',
  'src/components/SignupForm.tsx',
  'src/pages/api/auth/login.ts',
  'src/pages/api/auth/signup.ts',
  'src/lib/auth.ts',
];

console.log('■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■');
console.log('Enkaiコスト見積もりサンプル');
console.log('■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■\n');

console.log(`[タスク概要]`);
console.log(taskDescription);

// 3. Gemini 1.5 Flashモデルで見積もり
const flashEstimation = enkai.estimateCost(taskDescription, {
  targetFiles,
  model: 'flash',
  averageOutputTokens: 800, // APIやUIコンポーネントなので少し多めに設定
});

console.log('----------------------------------------');
console.log(flashEstimation.costDetails);


// 4. Gemini 1.5 Proモデルで見積もり
const proEstimation = enkai.estimateCost(taskDescription, {
  targetFiles,
  model: 'pro',
  averageOutputTokens: 1200, // Proはより高品質なコードを生成すると仮定し、トークン数を多めに設定
});

console.log('----------------------------------------');
console.log(proEstimation.costDetails);
