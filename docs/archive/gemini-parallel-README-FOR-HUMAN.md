# Gemini Parallel - 人間が行う作業のみ

## 1. 初回セットアップ（5分）

### APIキー取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. 「Create API Key」をクリック
3. キーをコピー

### 環境設定
```bash
# ターミナルで実行
export GEMINI_API_KEY="コピーしたAPIキー"
```

## 2. 実行するだけ

### 基本コマンド
```bash
# Webアプリ作成
npx tsx gemini-parallel.ts create-web-app

# ゲームコンポーネント作成
npx tsx gemini-parallel.ts create-game-components

# 高速化（並列数を増やす）
npx tsx gemini-parallel.ts create-web-app -c 20
```

## 3. カスタマイズしたい場合

### テンプレート作成
`templates/my-app.json`を作成:
```json
[
  {
    "fileName": "作りたいファイル名.tsx",
    "outputPath": "./保存先/ファイル名.tsx",
    "prompt": "何を作りたいか日本語で書く"
  }
]
```

### 実行
```bash
npx tsx gemini-parallel.ts from-template my-app
```

## 4. よくある質問

**Q: エラーが出た**
```bash
# APIキーを再設定
export GEMINI_API_KEY="あなたのAPIキー"
```

**Q: 遅い**
```bash
# 並列数を増やす（-c 20など）
npx tsx gemini-parallel.ts create-web-app -c 20
```

**Q: 生成されたコードを確認したい**
- `components/`フォルダを開く
- 各ファイルが完全自己完結型で生成される

## 5. 実用例

### ECサイト一式を5秒で生成
```bash
npx tsx gemini-parallel.ts from-template e-commerce -c 20
```

### ダッシュボード一式を生成
```bash
npx tsx gemini-parallel.ts from-template dashboard-components -c 20
```

### 結果
- 5つのコンポーネントが並列生成
- 各ファイル1500行程度の完全実装
- すぐに使える状態

## 6. 注意事項

- **APIキーは他人に教えない**
- **生成されたコードは必ず確認**（AIなので稀にエラーあり）
- **大量生成時はAPI利用料金に注意**（月$0-5程度）

## それだけ！

人間がやることは：
1. APIキー設定
2. コマンド実行
3. 生成されたコードを使う

以上です。コード書く必要なし。