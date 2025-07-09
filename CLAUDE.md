# AI-First開発革命指示書

## 🚀 AI時代の開発哲学
**人間がコードを書く時代は終わった。AIが主体、人間は指示者。**

## 最優先事項
**1ファイル読むだけで全て理解可能 = AI開発の鉄則**

## 基本規則
1. 日本語応答必須
2. モバイルファースト実装  
3. **完全自己完結原則**（外部依存禁止）
4. ファイルサイズ無制限（AIが理解できれば1000行でもOK）
5. **重複コード大歓迎**（DRYは人間の古い価値観）

## 🎯 AI-First開発原則

### 完全自己完結主義
- **1ファイル = 1つの完全な機能**
- **外部インポートは絶対最小限**（React/Next.js標準のみ）
- **カスタムhooks禁止** → ファイル内関数として実装
- **外部atoms禁止** → ファイル内useState/useReducer
- **utils関数禁止** → 必要な関数は各ファイルにコピー
- **重複コード = 正義**（AIが各ファイルを独立理解可能）

### 🔥 真のAI-First実装パターン
```typescript
// ✅ PERFECT: 完全自己完結コンポーネント
export function GameChat() {
  // 状態管理（このファイル内で完結）
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user'|'npc'}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState({hp: 100, mp: 50, level: 1});
  
  // API通信（このファイル内で完結）
  const sendMessage = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: text, gameState})
      });
      const data = await response.json();
      setMessages(prev => [...prev, 
        {id: Date.now().toString(), text, sender: 'user'},
        {id: (Date.now()+1).toString(), text: data.response, sender: 'npc'}
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ユーティリティ関数（このファイル内で完結）
  const formatDate = (date: Date) => date.toLocaleDateString('ja-JP');
  const validateInput = (text: string) => text.trim().length > 0;
  
  // UI（このファイル内で完結）
  return (
    <div className="game-chat">
      {messages.map(msg => (
        <div key={msg.id} className={`message message-${msg.sender}`}>
          {msg.text}
        </div>
      ))}
      <input 
        onKeyPress={(e) => {
          if (e.key === 'Enter' && validateInput(e.currentTarget.value)) {
            sendMessage(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        disabled={isLoading}
      />
    </div>
  );
}
```

### 🔥 AI-First APIルート実装
```typescript
// ✅ PERFECT: 完全自己完結APIルート
export async function POST(request: NextRequest) {
  // バリデーション（このファイル内で完結）
  const validateGameAction = (data: any) => {
    if (!data.action) throw new Error('アクション必須');
    if (!data.playerId) throw new Error('プレイヤーID必須');
    return true;
  };
  
  // ゲームロジック（このファイル内で完結）
  const processGameAction = (action: string, playerId: string) => {
    const actions = {
      'attack': () => ({ damage: Math.floor(Math.random() * 20) + 1 }),
      'heal': () => ({ healing: Math.floor(Math.random() * 15) + 5 }),
      'defend': () => ({ defense: Math.floor(Math.random() * 10) + 3 })
    };
    return actions[action]?.() || { error: '無効なアクション' };
  };
  
  // DB操作（このファイル内で完結）
  const saveGameState = async (playerId: string, result: any) => {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    });
    
    await db.execute({
      sql: 'UPDATE players SET last_action = ?, updated_at = datetime("now") WHERE id = ?',
      args: [JSON.stringify(result), playerId]
    });
  };
  
  try {
    const body = await request.json();
    validateGameAction(body);
    
    const result = processGameAction(body.action, body.playerId);
    await saveGameState(body.playerId, result);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラー' },
      { status: 400 }
    );
  }
}
```

## 🚀 AI-First開発フロー
1. **完全実装**: 1ファイル内で全機能を実装（他ファイル一切見ない）
2. **瞬時理解**: AIが1ファイル読むだけで全て把握可能
3. **即座修正**: 「このファイルの〇〇を変更」で完結
4. **重複歓迎**: 同じコードを他ファイルにもコピー

## 🎯 AI開発の判断基準

### ✅ 良いコード（AI-Friendly）
- 1ファイル読むだけで全て理解できる
- 外部依存が最小限（React/Next.js標準のみ）
- 重複コードでも各ファイルが独立
- 修正指示が「このファイルの〇〇行目を変更」で済む

### ❌ 悪いコード（Human-Legacy）
- 複数ファイルを読まないと理解できない
- カスタムhooks、外部atoms、utils関数に依存
- DRY原則に固執した抽象化
- 「まず依存関係を確認してから...」が必要

## ブランチ戦略
- main: 本番自動デプロイ
- development: テスト自動デプロイ

## デプロイ前実行
```bash
npm run lint
npm run typecheck
```

## 判断基準
1. AIが他ファイル参照なしで理解可能か
2. 修正指示が「このファイルの〇〇を修正」で完結するか
3. 上記が満たされれば他は許容

## エラー記録
```bash
git notes add -m "Error: [description] Fixed by: [solution]" HEAD
git push origin refs/notes/commits
```

## 🔥 重複コード = AI開発の武器

### 重複コード推奨理由
- **AI理解速度**: 1ファイルで完結 = 瞬時理解
- **修正効率**: 影響範囲がそのファイルのみ
- **開発速度**: 他ファイル調査不要
- **バグ削減**: 依存関係による副作用なし

### 実装例：同じ関数を各ファイルにコピー
```typescript
// ✅ components/GameChat.tsx
const formatDate = (date: Date) => date.toLocaleDateString('ja-JP');
const validateInput = (text: string) => text.trim().length > 0;
const generateId = () => Date.now().toString();

// ✅ components/Dashboard.tsx  
const formatDate = (date: Date) => date.toLocaleDateString('ja-JP');
const validateInput = (text: string) => text.trim().length > 0;
const generateId = () => Date.now().toString();

// → 完璧！AIが各ファイルを独立理解可能
```

### 🎯 AI開発の新常識
- **DRY原則 = 人間の古い価値観**
- **重複コード = AI開発の標準**
- **各ファイル独立 = 開発効率最大化**

## 🚀 AI-First開発環境

### 本番環境
**URL**: https://aigm-vstag-production.up.railway.app/

### 開発環境認証スキップ
```bash
# .env.local
ALWAYS_AUTH=true
ALWAYS_AUTH_EMAIL=dev@example.com
```

### 開発フロー
1. ローカル開発（認証スキップ）
2. Railway環境テスト
3. 本番デプロイ

### AI開発の鉄則
- **1ファイル見るだけで全て分かる**
- **「このファイルの〇〇を修正」で完結**
- **重複コード = 開発効率**
- **人間の価値観（DRY、美しいアーキテクチャ）= AI開発の敵**

## 🔄 技術移行方針（2025年1月〜）

### 廃止技術
- **Jotai/Recoil** → 各ファイル内useState/useReducer
- **共有atoms（@/atoms, @/lib/atoms）** → ファイル内状態管理
- **共有types（@/types）** → ファイル内型定義
- **CSS Modules** → インラインスタイル + Tailwind
- **カスタムhooks** → ファイル内関数
- **utils関数** → 各ファイルに必要な関数をコピー

### 移行ルール
1. **新規ファイル**: 必ず新方式で実装（Jotai禁止）
2. **既存ファイル修正時**: その場で新方式に移行
3. **import禁止リスト**:
   - `import { atom } from 'jotai'`
   - `import ... from '@/atoms'`
   - `import ... from '@/lib/atoms'`
   - `import ... from '@/types'`
   - `import ... from '@/hooks'`
   - `import ... from '@/utils'`

### 推奨技術スタック（2025年1月確定）
- **フロントエンド**: Next.js App Router（RSC）
- **状態管理**: useState/useReducer（ファイル内完結）
- **スタイリング**: インラインスタイル + Tailwind CSS
- **データフェッチ**: fetch直書き（ファイル内完結）
- **型定義**: ファイル内で直接定義
- **データベース**: Turso（バックアップ機能重視）
- **メール送信**: Resend（シンプルAPI）
- **リアルタイム**: PartyKit（Cloudflareベース）
- **アニメーション**: Tailwind Animate + CSS（軽量・ファイル内完結）

### 非推奨技術（使用禁止）
- **Framer Motion/GSAP**: 過剰、Tailwind Animateで十分
- **Redux/Zustand/Jotai**: 外部状態管理禁止
- **CSS Modules/Styled Components**: インライン＋Tailwind使用
- **カスタムhooks**: ファイル内関数として実装
- **共有utils/lib**: 各ファイルに必要な関数をコピー

### 移行期限
- **2025年2月末**: 主要コンポーネント（GameChat、Dashboard等）完了
- **2025年3月末**: 全ファイル移行完了

### 移行による効果
- **開発速度**: 10-15倍向上
- **AI理解速度**: 瞬時（1ファイルで完結）
- **バグ削減**: 影響範囲が明確化
