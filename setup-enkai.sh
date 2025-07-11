#!/bin/bash

# enkai簡単セットアップスクリプト
# 一発でenkaiを使えるようにする

set -e

# 色付きメッセージ
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 enkai 簡単セットアップ${NC}"
echo ""

# 1. インストールスクリプトを実行
if [ -f "./install-enkai.sh" ]; then
    echo -e "${YELLOW}📦 enkaiをインストール中...${NC}"
    ./install-enkai.sh
else
    echo -e "${RED}エラー: install-enkai.shが見つかりません${NC}"
    exit 1
fi

# 2. .enkairc設定ファイルをホームディレクトリにコピー
echo -e "${YELLOW}🔧 設定ファイルを配置中...${NC}"
cp .enkairc "$HOME/.enkairc"

# 3. シェルRCファイルに設定を追加
SHELL_RC=""
if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ] || [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC="$HOME/.profile"
fi

# .enkairc読み込み設定を追加（重複を避ける）
ENKAI_SOURCE_LINE='[ -f "$HOME/.enkairc" ] && source "$HOME/.enkairc"'
if ! grep -q ".enkairc" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# enkai設定" >> "$SHELL_RC"
    echo "$ENKAI_SOURCE_LINE" >> "$SHELL_RC"
    echo -e "${GREEN}✅ .enkairc読み込み設定を追加しました${NC}"
fi

# 4. 現在のシェルに設定を読み込む
source "$HOME/.enkairc"

# 5. APIキー設定の案内
echo ""
echo -e "${GREEN}✅ enkaiのセットアップが完了しました！${NC}"
echo ""
echo -e "${YELLOW}📝 次のステップ:${NC}"
echo ""
echo "1. 新しいターミナルを開くか、以下を実行:"
echo -e "   ${GREEN}source $SHELL_RC${NC}"
echo ""
echo "2. APIキーを設定（まだの場合）:"
echo -e "   ${GREEN}enkai_quick_setup YOUR_GEMINI_API_KEY${NC}"
echo "   または"
echo -e "   ${GREEN}ek api set YOUR_GEMINI_API_KEY${NC}"
echo ""
echo -e "${BLUE}🎯 便利なコマンド:${NC}"
echo "  ek              # enkaiの短縮形"
echo "  ekg             # enkai geminiの短縮形"
echo "  eka             # enkai apiの短縮形"
echo ""
echo -e "${BLUE}🛠 便利な関数:${NC}"
echo "  enkai_setup_project    # 現在のプロジェクトでenkaiを使う準備"
echo "  enkai_quick_setup KEY  # APIキーを一発設定"
echo ""

# 6. 自動でAPIキー設定を促す
echo -e "${YELLOW}💡 今すぐAPIキーを設定しますか？ (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Gemini APIキーを入力してください:${NC}"
    read -r api_key
    if [ -n "$api_key" ]; then
        "$HOME/bin/enkai" api set "$api_key"
        export GEMINI_API_KEY="$api_key"
        echo -e "${GREEN}✅ APIキーを設定しました！${NC}"
        echo ""
        echo -e "${YELLOW}永続化するには.zshrcまたは.bashrcに以下を追加:${NC}"
        echo "export GEMINI_API_KEY=\"$api_key\""
    fi
fi

echo ""
echo -e "${GREEN}🎉 セットアップ完了！ enkaiをお楽しみください！${NC}"