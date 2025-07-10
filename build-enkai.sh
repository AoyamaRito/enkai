#!/bin/bash

# enkaiビルドスクリプト

# バージョン情報
VERSION="1.0.0"
BUILD_TIME=$(date +"%Y-%m-%d %H:%M:%S")

# ビルド実行
echo "enkaiをビルドしています..."
go build -ldflags "-X 'main.version=$VERSION' -X 'main.buildTime=$BUILD_TIME'" -o enkai enkai.go

if [ $? -eq 0 ]; then
    echo "ビルド成功！"
    echo ""
    echo "インストール方法:"
    echo "  sudo mv enkai /usr/local/bin/"
    echo ""
    echo "使用方法:"
    echo "  enkai api set <API_KEY>  - APIキーを設定"
    echo "  enkai api delete         - APIキーを削除"
    echo "  enkai api status         - APIキーの状態を確認"
    echo "  enkai gemini <command>   - Gemini並列実行ツールを起動"
else
    echo "ビルドに失敗しました"
    exit 1
fi