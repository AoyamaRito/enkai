'use client';

import React, { useState } from 'react';
import GameChat from '../components/GameChat';
import PlayerProfile from '../components/PlayerProfile';
import ItemInventory from '../components/ItemInventory';
import BattleSystem from '../components/BattleSystem';
import QuestBoard from '../components/QuestBoard';

export default function GameDashboard() {
  const [activeComponent, setActiveComponent] = useState<string>('overview');

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'chat':
        return <GameChat />;
      case 'profile':
        return <PlayerProfile />;
      case 'inventory':
        return <ItemInventory />;
      case 'battle':
        return <BattleSystem />;
      case 'quests':
        return <QuestBoard />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ミニプレビュー */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">ゲームチャット</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">リアルタイムでプレイヤーとコミュニケーション</p>
              <button 
                onClick={() => setActiveComponent('chat')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                チャットを開く
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">プレイヤープロフィール</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">プレイヤーのステータスとプロフィール管理</p>
              <button 
                onClick={() => setActiveComponent('profile')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                プロフィールを開く
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">アイテムインベントリ</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">アイテムの管理と整理システム</p>
              <button 
                onClick={() => setActiveComponent('inventory')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                インベントリを開く
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">バトルシステム</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">ターンベースの戦闘システム</p>
              <button 
                onClick={() => setActiveComponent('battle')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                バトルを開始
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">クエストボード</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">利用可能なクエストの確認と管理</p>
              <button 
                onClick={() => setActiveComponent('quests')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
              >
                クエストを見る
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Gemini並列生成デモ</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                これらのコンポーネントはGemini 2.0 Flashで並列生成されました
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>生成時間: 20秒</p>
                <p>コンポーネント数: 5個</p>
                <p>総行数: 1,332行</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Game Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gemini並列生成で作成されたゲームコンポーネント集
            </p>
          </div>
          
          {activeComponent !== 'overview' && (
            <button
              onClick={() => setActiveComponent('overview')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← ダッシュボードに戻る
            </button>
          )}
        </div>

        {/* ナビゲーション */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'overview', label: 'ダッシュボード', color: 'gray' },
              { key: 'chat', label: 'チャット', color: 'blue' },
              { key: 'profile', label: 'プロフィール', color: 'green' },
              { key: 'inventory', label: 'インベントリ', color: 'purple' },
              { key: 'battle', label: 'バトル', color: 'red' },
              { key: 'quests', label: 'クエスト', color: 'yellow' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveComponent(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeComponent === key
                    ? `bg-${color}-500 text-white`
                    : `bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-${color}-100 dark:hover:bg-gray-600`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* メインコンテンツ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {renderActiveComponent()}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p>🤖 Generated with Gemini 2.0 Flash | Powered by AI-First Development</p>
        </div>
      </div>
    </div>
  );
}