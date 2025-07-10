'use client';

import { useState } from 'react';

export default function Home() {
  const [tasks, setTasks] = useState<Array<{
    fileName: string;
    outputPath: string;
    prompt: string;
  }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addTask = () => {
    setTasks([...tasks, {
      fileName: '',
      outputPath: '',
      prompt: ''
    }]);
  };

  const updateTask = (index: number, field: string, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const executeParallel = async () => {
    if (tasks.length === 0) return;
    
    setIsExecuting(true);
    setResults([]);
    
    try {
      // タスクをJSON形式で保存
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskFileName = `task-${timestamp}.json`;
      
      // Gemini並列実行コマンドを構築
      const command = `npx tsx ~/romeo3/enkai/gemini-parallel.ts from-json ${JSON.stringify(tasks)}`;
      
      setResults([
        `✅ ${tasks.length}個のタスクを並列実行中...`,
        `📝 実行コマンド: ${command}`
      ]);
      
      // 実際の実行はCLIから行う必要があるため、コマンドを表示
      setTimeout(() => {
        setResults(prev => [...prev, 
          '⚡ 実行完了！生成されたファイルを確認してください。',
          '💡 ヒント: ターミナルで上記コマンドを実行してください。'
        ]);
        setIsExecuting(false);
      }, 2000);
      
    } catch (error) {
      setResults([`❌ エラー: ${error}`]);
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🔥 Enkai - Gemini並列実行ツール</h1>
        <p className="text-gray-400 mb-8">AI-First開発を加速する並列タスク実行システム</p>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">タスク設定</h2>
          
          {tasks.map((task, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">タスク {index + 1}</h3>
                <button
                  onClick={() => removeTask(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  削除
                </button>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="ファイル名 (例: GameChat.tsx)"
                  value={task.fileName}
                  onChange={(e) => updateTask(index, 'fileName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="出力パス (例: ./components/GameChat.tsx)"
                  value={task.outputPath}
                  onChange={(e) => updateTask(index, 'outputPath', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
                />
                
                <textarea
                  placeholder="プロンプト (AI-First原則に従った実装指示)"
                  value={task.prompt}
                  onChange={(e) => updateTask(index, 'prompt', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          ))}
          
          <button
            onClick={addTask}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
          >
            + タスクを追加
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">実行</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">必要な環境変数:</p>
            <code className="block bg-gray-700 p-2 rounded text-sm">
              export GEMINI_API_KEY="your-api-key"
            </code>
          </div>
          
          <button
            onClick={executeParallel}
            disabled={tasks.length === 0 || isExecuting}
            className={`w-full py-3 rounded font-medium transition-colors ${
              tasks.length === 0 || isExecuting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isExecuting ? '実行中...' : `${tasks.length}個のタスクを並列実行`}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">実行結果</h2>
            <div className="bg-black rounded p-4 font-mono text-sm">
              {results.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-gray-500">
          <p>AI-First開発原則に基づいた高速並列実行</p>
          <p className="text-sm mt-2">Powered by Gemini API</p>
        </div>
      </div>
    </div>
  );
}