#!/bin/bash

# enkai インストールスクリプト
# このスクリプトはenkaiをビルドし、システムにインストールし、PATHを自動設定します

set -e  # エラーが発生したら停止

# 色付きメッセージ
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 enkai インストーラー${NC}"
echo ""

# 1. Goがインストールされているか確認
if ! command -v go &> /dev/null; then
    echo -e "${RED}エラー: Goがインストールされていません${NC}"
    echo "https://golang.org/dl/ からGoをインストールしてください"
    exit 1
fi

# 2. ビルド
echo -e "${YELLOW}📦 enkaiをビルド中...${NC}"
VERSION="1.0.0"
BUILD_TIME=$(date +"%Y-%m-%d %H:%M:%S")
go build -ldflags "-X 'main.version=$VERSION' -X 'main.buildTime=$BUILD_TIME'" -o enkai enkai.go

if [ $? -ne 0 ]; then
    echo -e "${RED}ビルドに失敗しました${NC}"
    exit 1
fi

# 3. インストール先を決定
INSTALL_DIR="$HOME/bin"
if [ -w "/usr/local/bin" ] && [ "$1" == "--system" ]; then
    INSTALL_DIR="/usr/local/bin"
    echo -e "${YELLOW}📍 システム全体にインストール: $INSTALL_DIR${NC}"
else
    echo -e "${YELLOW}📍 ユーザーディレクトリにインストール: $INSTALL_DIR${NC}"
    mkdir -p "$INSTALL_DIR"
fi

# 4. 実行ファイルをコピー
echo -e "${YELLOW}📂 実行ファイルをインストール中...${NC}"
cp enkai "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/enkai"

# 5. PATH設定（ユーザーインストールの場合のみ）
if [ "$INSTALL_DIR" == "$HOME/bin" ]; then
    echo -e "${YELLOW}🔧 PATH設定を更新中...${NC}"
    
    # シェルを検出
    SHELL_RC=""
    if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
        SHELL_RC="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ] || [ -f "$HOME/.bashrc" ]; then
        SHELL_RC="$HOME/.bashrc"
    else
        SHELL_RC="$HOME/.profile"
    fi
    
    # PATH設定を追加（重複を避ける）
    PATH_LINE='export PATH="$HOME/bin:$PATH"'
    if ! grep -q "$PATH_LINE" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# enkai PATH設定" >> "$SHELL_RC"
        echo "$PATH_LINE" >> "$SHELL_RC"
        echo -e "${GREEN}✅ PATH設定を $SHELL_RC に追加しました${NC}"
    else
        echo -e "${GREEN}✅ PATH設定は既に存在します${NC}"
    fi
fi

# 6. インストール完了
echo ""
echo -e "${GREEN}🎉 enkaiのインストールが完了しました！${NC}"
echo ""

# 7. 使用方法を表示
if [ "$INSTALL_DIR" == "$HOME/bin" ]; then
    echo -e "${YELLOW}次のコマンドを実行してPATHを有効にしてください:${NC}"
    echo -e "  ${GREEN}source $SHELL_RC${NC}"
    echo ""
    echo -e "${YELLOW}または新しいターミナルを開いてください${NC}"
else
    echo -e "${GREEN}enkaiコマンドがすぐに使用可能です${NC}"
fi

echo ""
echo -e "${YELLOW}使用例:${NC}"
echo "  enkai --help              # ヘルプを表示"
echo "  enkai api set <API_KEY>   # APIキーを設定"
echo "  enkai gemini from-template <name>  # テンプレートを実行"
echo ""

# 8. APIキー設定の確認
if command -v "$INSTALL_DIR/enkai" &> /dev/null; then
    API_STATUS=$("$INSTALL_DIR/enkai" api status 2>&1 | grep "未設定" || true)
    if [ -n "$API_STATUS" ]; then
        echo -e "${YELLOW}💡 ヒント: APIキーを設定するには:${NC}"
        echo "  enkai api set <YOUR_GEMINI_API_KEY>"
        echo ""
    fi
fi

echo -e "${GREEN}詳細は enkai --help を参照してください${NC}"