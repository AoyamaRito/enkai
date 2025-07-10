#!/bin/bash

# 既存プロジェクトにGemini並列実行ツールをインストールするスクリプト

echo "🚀 Gemini並列実行ツールをプロジェクトにインストールします"

# 必要なファイルをコピー
echo "📁 ファイルをコピー中..."
cp gemini-parallel.ts "$1/"
cp gemini-execute.ts "$1/"

# package.jsonに必要な依存関係を追加
echo "📦 依存関係を追加中..."
cd "$1"

# 必要なパッケージをインストール
npm install --save-dev \
  @google/generative-ai \
  commander \
  chalk \
  ora \
  p-limit \
  tsx \
  typescript \
  @types/node

# package.jsonにスクリプトを追加
echo "📝 package.jsonを更新中..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['gemini'] = 'tsx gemini-parallel.ts';
pkg.scripts['gemini:execute'] = 'tsx gemini-execute.ts';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# テンプレートディレクトリを作成
mkdir -p templates

# サンプルテンプレートを作成
cat > templates/example.json << 'EOF'
[
  {
    "fileName": "Component.tsx",
    "outputPath": "./components/Component.tsx",
    "prompt": "シンプルなReactコンポーネントを作成"
  }
]
EOF

echo "✅ インストール完了！"
echo ""
echo "使い方:"
echo "  npm run gemini from-template example"
echo "  npm run gemini:execute"
echo ""
echo "APIキーの設定:"
echo "  export GEMINI_API_KEY='your-api-key'"