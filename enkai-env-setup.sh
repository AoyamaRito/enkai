#!/bin/bash

# enkai環境変数設定スクリプト
# sourceコマンドで実行することで、現在のシェルセッションにenkai環境を設定

# APIキー管理ディレクトリ
ENKAI_CONFIG_DIR="$HOME/.enkai"
ENKAI_CONFIG_FILE="$ENKAI_CONFIG_DIR/config.json"

# 色付きメッセージ
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# APIキーを環境変数に設定
if [ -f "$ENKAI_CONFIG_FILE" ]; then
    # jqがインストールされている場合
    if command -v jq &> /dev/null; then
        API_KEY=$(jq -r '.apiKey // empty' "$ENKAI_CONFIG_FILE" 2>/dev/null)
        if [ -n "$API_KEY" ]; then
            export GEMINI_API_KEY="$API_KEY"
            echo -e "${GREEN}✅ Gemini APIキーを環境変数に設定しました${NC}"
        fi
    else
        # jqがない場合は簡易的な方法で取得
        API_KEY=$(grep -o '"apiKey"[[:space:]]*:[[:space:]]*"[^"]*"' "$ENKAI_CONFIG_FILE" 2>/dev/null | cut -d'"' -f4)
        if [ -n "$API_KEY" ]; then
            export GEMINI_API_KEY="$API_KEY"
            echo -e "${GREEN}✅ Gemini APIキーを環境変数に設定しました${NC}"
        fi
    fi
fi

# PATH設定（未設定の場合のみ）
if [[ ":$PATH:" != *":$HOME/bin:"* ]]; then
    export PATH="$HOME/bin:$PATH"
    echo -e "${GREEN}✅ PATHを設定しました${NC}"
fi

# エイリアス設定
alias ek='enkai'
alias ekg='enkai gemini'
alias eka='enkai api'

# 現在の設定状態を表示
echo -e "${YELLOW}📊 現在の設定:${NC}"
echo "  PATH: $(command -v enkai 2>/dev/null || echo '未設定')"
echo "  APIキー: $([ -n "$GEMINI_API_KEY" ] && echo '設定済み' || echo '未設定')"
echo ""
echo -e "${YELLOW}💡 このスクリプトを毎回実行するには:${NC}"
echo "  source ~/enkai/enkai-env-setup.sh"