package analyzer

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// Scanner はファイルスキャン機能を提供
type Scanner struct {
	config Config
}

// NewScanner は新しいScannerを作成
func NewScanner(config Config) *Scanner {
	return &Scanner{
		config: config,
	}
}

// ScanFiles は指定されたパスのファイルをスキャン
func (s *Scanner) ScanFiles() ([]FileInfo, error) {
	var files []FileInfo

	// デフォルトの除外パターン
	defaultExcludes := []string{
		"node_modules",
		".git",
		"build",
		"dist",
		"vendor",
		".next",
		"coverage",
		"*.log",
		"*.lock",
	}

	// .gitignoreの読み込み
	gitignorePatterns := s.loadGitignore()
	excludePatterns := append(defaultExcludes, gitignorePatterns...)

	// カスタム除外パターンの追加
	if s.config.ExcludePattern != "" {
		excludePatterns = append(excludePatterns, s.config.ExcludePattern)
	}

	for _, path := range s.config.Paths {
		err := filepath.Walk(path, func(filePath string, info os.FileInfo, err error) error {
			if err != nil {
				return nil // エラーをスキップ
			}

			// ディレクトリはスキップ
			if info.IsDir() {
				// 除外ディレクトリのチェック
				for _, exclude := range excludePatterns {
					if strings.Contains(filePath, exclude) {
						return filepath.SkipDir
					}
				}
				return nil
			}

			// ファイルサイズチェック（10MB以上は除外）
			if info.Size() > 10*1024*1024 {
				return nil
			}

			// 除外パターンのチェック
			shouldExclude := false
			for _, exclude := range excludePatterns {
				if matched, _ := filepath.Match(exclude, filepath.Base(filePath)); matched {
					shouldExclude = true
					break
				}
			}
			if shouldExclude {
				return nil
			}

			// インクルードパターンのチェック
			if s.config.IncludePattern != "" {
				matched, _ := filepath.Match(s.config.IncludePattern, filePath)
				if !matched {
					return nil
				}
			}

			// ファイルの読み込み
			content, err := s.readFile(filePath)
			if err != nil {
				return nil // 読み込みエラーはスキップ
			}

			files = append(files, FileInfo{
				Path:     filePath,
				Content:  content,
				Language: s.detectLanguage(filePath),
				Size:     info.Size(),
			})

			return nil
		})

		if err != nil {
			return nil, fmt.Errorf("ファイルスキャンエラー: %w", err)
		}
	}

	return files, nil
}

// loadGitignore は.gitignoreファイルを読み込む
func (s *Scanner) loadGitignore() []string {
	var patterns []string

	file, err := os.Open(".gitignore")
	if err != nil {
		return patterns
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line != "" && !strings.HasPrefix(line, "#") {
			patterns = append(patterns, line)
		}
	}

	return patterns
}

// readFile はファイルを読み込む（テキストファイルのみ）
func (s *Scanner) readFile(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// バイナリファイルのチェック
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return "", err
	}

	if !isTextFile(buffer[:n]) {
		return "", fmt.Errorf("バイナリファイル")
	}

	// ファイルを最初から読み直す
	file.Seek(0, 0)
	content, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	return string(content), nil
}

// isTextFile はテキストファイルかどうかを判定
func isTextFile(data []byte) bool {
	for _, b := range data {
		if b == 0 {
			return false
		}
	}
	return true
}

// detectLanguage はファイルの言語を検出
func (s *Scanner) detectLanguage(path string) string {
	ext := strings.ToLower(filepath.Ext(path))
	
	languageMap := map[string]string{
		".go":   "go",
		".ts":   "typescript",
		".tsx":  "typescript",
		".js":   "javascript",
		".jsx":  "javascript",
		".py":   "python",
		".java": "java",
		".c":    "c",
		".cpp":  "cpp",
		".rs":   "rust",
		".rb":   "ruby",
		".php":  "php",
		".cs":   "csharp",
		".swift": "swift",
		".kt":   "kotlin",
		".scala": "scala",
		".r":    "r",
		".sql":  "sql",
		".sh":   "shell",
		".yaml": "yaml",
		".yml":  "yaml",
		".json": "json",
		".xml":  "xml",
		".html": "html",
		".css":  "css",
		".scss": "scss",
		".md":   "markdown",
	}

	if lang, ok := languageMap[ext]; ok {
		return lang
	}

	// ファイル名から判定
	baseName := filepath.Base(path)
	if baseName == "Dockerfile" {
		return "dockerfile"
	}
	if baseName == "Makefile" {
		return "makefile"
	}
	if strings.HasPrefix(baseName, ".") {
		return "config"
	}

	return "text"
}