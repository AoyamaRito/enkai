#!/bin/bash

# ビルドスクリプト - APIキーを埋め込んだ実行ファイルを作成

# APIキーを引数から取得
API_KEY="${1:-}"

if [ -z "$API_KEY" ]; then
    echo "使用方法: ./build-apikey-holder.sh <GEMINI_API_KEY>"
    echo "例: ./build-apikey-holder.sh AIzaSyC0jhQwBAE69IIfro7hVuXAfOyTW9Zb8n4"
    exit 1
fi

# 現在時刻を取得
BUILD_TIME=$(date +"%Y-%m-%d %H:%M:%S")

# ビルド実行
echo "APIキーを埋め込んだ実行ファイルをビルドしています..."
go build -ldflags "-X 'main.geminiAPIKey=$API_KEY' -X 'main.buildTime=$BUILD_TIME'" -o apikey-holder apikey-holder.go

if [ $? -eq 0 ]; then
    echo "ビルド成功！"
    echo ""
    echo "使用方法:"
    echo "  ./apikey-holder show    - APIキーを表示"
    echo "  ./apikey-holder export  - export文を出力"
    echo "  ./apikey-holder version - バージョン情報を表示"
    echo ""
    echo "環境変数として設定する場合:"
    echo "  eval \$(./apikey-holder export)"
else
    echo "ビルドに失敗しました"
    exit 1
fi