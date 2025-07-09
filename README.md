# Gemini Parallel - AI並列コード生成ツール

Gemini 2.0 Flash APIを使用して、複数のコンポーネントを並列生成するCLIツールです。

## 特徴

- 🚀 **並列実行**: 複数のタスクを同時実行で高速化
- 🎯 **AI-First原則**: 完全自己完結コンポーネント生成
- 📊 **詳細レポート**: 実行結果の詳細なJSON形式レポート
- 🎨 **美しいCLI**: カラフルな進捗表示とスピナー
- ⚡ **高速**: Gemini 2.0 Flash使用で高速レスポンス

## インストール

```bash
npm install
```

## 環境変数設定

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

## 使い方

### ゲームコンポーネント生成

```bash
# 5つのゲームコンポーネントを並列生成
npx tsx gemini-parallel.ts create-game-components

# 並列実行数を指定（デフォルト: 5）
npx tsx gemini-parallel.ts create-game-components -c 10
```

生成されるコンポーネント:
- `GameChat.tsx` - NPCチャットシステム
- `PlayerProfile.tsx` - プレイヤープロフィール
- `ItemInventory.tsx` - アイテム管理
- `BattleSystem.tsx` - バトルシステム
- `QuestBoard.tsx` - クエスト管理

### Webアプリコンポーネント生成

```bash
npx tsx gemini-parallel.ts create-web-app
```

### テンプレートから実行

```bash
# templates/my-template.json から実行
npx tsx gemini-parallel.ts from-template my-template
```

## テンプレート形式

`templates/`ディレクトリにJSONファイルを配置:

```json
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "コンポーネントの実装指示..."
  }
]
```

## 実行結果

実行後、以下が生成されます:
- 指定されたコンポーネントファイル
- `gemini-report-[timestamp].json` - 詳細な実行レポート

## AI-First開発原則

生成されるコードは以下の原則に従います:

- **完全自己完結**: 1ファイル = 1機能
- **外部依存最小**: React/Next.js標準のみ
- **状態管理**: useState/useReducer使用
- **スタイリング**: インラインスタイル + Tailwind CSS
- **モバイルファースト**: レスポンシブ対応

## 開発

```bash
# TypeScriptで直接実行
npm run dev create-game-components

# ビルド
npm run build

# ビルド後の実行
npm start create-game-components
```