import React, { useState, useReducer, useEffect } from 'react';

// ----------------------------------------------------------------------------
// 型定義（このファイル内完結）
// ----------------------------------------------------------------------------

/**
 * 通知の型定義
 */
interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error';
}

/**
 * 通知設定の型定義
 */
interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// ----------------------------------------------------------------------------
// 状態管理（useState/useReducer、ファイル内完結）
// ----------------------------------------------------------------------------

// 初期通知データ（モック）
const initialNotifications: Notification[] = [
  { id: '1', message: 'Welcome to our platform!', timestamp: new Date(), read: false, type: 'info' },
  { id: '2', message: 'Your account has been updated.', timestamp: new Date(), read: true, type: 'info' },
  { id: '3', message: 'Security alert: Unusual activity detected.', timestamp: new Date(), read: false, type: 'warning' },
];

// 初期通知設定データ（モック）
const initialPreferences: NotificationPreferences = {
  email: true,
  push: false,
  sms: false,
};

// 通知Reducer
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string };

const notificationReducer = (state: Notification[], action: NotificationAction): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [action.payload, ...state];
    case 'MARK_AS_READ':
      return state.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
    case 'MARK_ALL_AS_READ':
      return state.map(notification => ({ ...notification, read: true }));
    case 'DELETE_NOTIFICATION':
      return state.filter(notification => notification.id !== action.payload);
    default:
      return state;
  }
};

// 設定Reducer
type PreferenceAction =
  | { type: 'TOGGLE_EMAIL' }
  | { type: 'TOGGLE_PUSH' }
  | { type: 'TOGGLE_SMS' };

const preferenceReducer = (state: NotificationPreferences, action: PreferenceAction): NotificationPreferences => {
  switch (action.type) {
    case 'TOGGLE_EMAIL':
      return { ...state, email: !state.email };
    case 'TOGGLE_PUSH':
      return { ...state, push: !state.push };
    case 'TOGGLE_SMS':
      return { ...state, sms: !state.sms };
    default:
      return state;
  }
};


// ----------------------------------------------------------------------------
// ユーティリティ関数（このファイル内完結、必要に応じてコピー）
// ----------------------------------------------------------------------------

/**
 * 日付を相対時間表記に変換する関数（例：1分前、2時間前）
 */
function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * ランダムなIDを生成する関数
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ----------------------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------------------

const NotificationCenter = () => {
  const [notifications, dispatch] = useReducer(notificationReducer, initialNotifications);
  const [preferences, preferenceDispatch] = useReducer(preferenceReducer, initialPreferences);
  const [newMessage, setNewMessage] = useState('');

  // ダミーのリアルタイムアップデート（5秒ごとに通知を追加）
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newNotification: Notification = {
        id: generateId(),
        message: `New update: ${newMessage || 'Something happened!'}`,
        timestamp: new Date(),
        read: false,
        type: 'info',
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    }, 5000); // 5秒ごとに実行

    return () => clearInterval(intervalId); // クリーンアップ
  }, [newMessage]);

  const handleMarkAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const handleMarkAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const handleDeleteNotification = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  const handleEmailToggle = () => {
    preferenceDispatch({ type: 'TOGGLE_EMAIL' });
  };

  const handlePushToggle = () => {
    preferenceDispatch({ type: 'TOGGLE_PUSH' });
  };

  const handleSmsToggle = () => {
    preferenceDispatch({ type: 'TOGGLE_SMS' });
  };

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notification Center</h1>

      {/* 新規メッセージ入力欄 */}
      <div className="mb-4">
        <label htmlFor="newMessage" className="block text-gray-700 text-sm font-bold mb-2">
          New Message:
        </label>
        <input
          type="text"
          id="newMessage"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={newMessage}
          onChange={handleNewMessageChange}
          placeholder="Enter a new message to send in notifications"
        />
      </div>

      {/* 通知リスト */}
      <div className="mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleMarkAllAsRead}
        >
          Mark All as Read
        </button>
      </div>

      <ul>
        {notifications.map(notification => (
          <li
            key={notification.id}
            className={`mb-2 p-3 border rounded ${!notification.read ? 'bg-gray-100' : ''}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{notification.message}</p>
                <p className="text-gray-500 text-sm">{timeAgo(notification.timestamp)}</p>
              </div>
              <div>
                {!notification.read && (
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-2"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* 通知設定 */}
      <div>
        <h2 className="text-xl font-bold mb-2">Notification Preferences</h2>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="email"
            className="mr-2"
            checked={preferences.email}
            onChange={handleEmailToggle}
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="push"
            className="mr-2"
            checked={preferences.push}
            onChange={handlePushToggle}
          />
          <label htmlFor="push">Push Notifications</label>
        </div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="sms"
            className="mr-2"
            checked={preferences.sms}
            onChange={handleSmsToggle}
          />
          <label htmlFor="sms">SMS</label>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;