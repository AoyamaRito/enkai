# Gemini並列実行ツール（最小版）

## セットアップ（初回のみ）
```bash
git clone https://github.com/AoyamaRito/enkai.git ~/enkai
cd ~/enkai && npm install
```

## 使用方法
```bash
# 実行
GEMINI_API_KEY="your-key" npx tsx ~/enkai/gemini-parallel.ts from-template tasks

# タスクファイル例 (templates/tasks.json)
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./src/Component.tsx",
    "prompt": "Reactコンポーネントの仕様..."
  }
]
```

## AI必須ルール
- 3つ以上のファイル生成 → このツール使用必須
- GitHub: https://github.com/AoyamaRito/enkai