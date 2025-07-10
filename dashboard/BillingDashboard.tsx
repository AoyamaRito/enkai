// BillingDashboard.jsx
// 1ファイル = 1つの完全な機能

import React, { useState, useReducer } from 'react';
import { useTailwind } from './tailwindContext'; // Tailwind を Context で提供

// 型定義 (ファイル内で直接定義)
/**
 * @typedef {object} SubscriptionState
 * @property {boolean} isActive - Subscription active status.
 * @property {string} tier - Subscription tier (e.g., "Basic", "Pro", "Enterprise").
 * @property {number} monthlyCost - Monthly cost of the subscription.
 */

/**
 * @typedef {object} Payment
 * @property {string} date - Date of the payment.
 * @property {number} amount - Amount of the payment.
 * @property {string} status - Status of the payment (e.g., "Success", "Failed").
 */

/**
 * @typedef {object} UpgradeOption
 * @property {string} tier - Tier name (e.g., "Pro", "Enterprise").
 * @property {number} monthlyCost - Monthly cost of the upgrade option.
 * @property {string} description - Description of the tier features.
 */


// 初期状態 (ファイル内完結)
const initialState = {
  isActive: true,
  tier: 'Basic',
  monthlyCost: 10,
  paymentHistory: [
    { date: '2024-01-01', amount: 10, status: 'Success' },
    { date: '2023-12-01', amount: 10, status: 'Success' },
    { date: '2023-11-01', amount: 10, status: 'Success' },
  ],
  upgradeOptions: [
    { tier: 'Pro', monthlyCost: 25, description: 'Advanced features and priority support.' },
    { tier: 'Enterprise', monthlyCost: 50, description: 'Unlimited usage and dedicated support.' },
  ],
};

// reducer (ファイル内完結)
const reducer = (state, action) => {
  switch (action.type) {
    case 'UPGRADE_SUBSCRIPTION':
      return { ...state, tier: action.payload.tier, monthlyCost: action.payload.monthlyCost };
    case 'CANCEL_SUBSCRIPTION':
      return { ...state, isActive: false };
    case 'REACTIVATE_SUBSCRIPTION':
      return { ...state, isActive: true };
    default:
      return state;
  }
};

const BillingDashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isActive, tier, monthlyCost, paymentHistory, upgradeOptions } = state;
  const { tw } = useTailwind(); // Tailwind CSS クラスを取得

  // フォーマットされた日付を返すユーティリティ関数 (ファイル内コピー)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };


  return (
    <div className={tw("p-4 bg-gray-100")}>
      <h1 className={tw("text-2xl font-bold mb-4")}>Billing Dashboard</h1>

      <div className={tw("mb-4 p-4 bg-white rounded-md shadow-md")}>
        <h2 className={tw("text-xl font-semibold mb-2")}>Subscription Status</h2>
        <p className={tw("text-gray-700")}>
          Status: <span className={tw(isActive ? "text-green-500" : "text-red-500")}>{isActive ? 'Active' : 'Inactive'}</span>
        </p>
        <p className={tw("text-gray-700")}>Tier: {tier}</p>
        <p className={tw("text-gray-700")}>Monthly Cost: ${monthlyCost}</p>

        {isActive ? (
          <button className={tw("bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2")} onClick={() => dispatch({ type: 'CANCEL_SUBSCRIPTION' })}>
            Cancel Subscription
          </button>
        ) : (
          <button className={tw("bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2")} onClick={() => dispatch({ type: 'REACTIVATE_SUBSCRIPTION' })}>
            Reactivate Subscription
          </button>
        )}
      </div>

      <div className={tw("mb-4 p-4 bg-white rounded-md shadow-md")}>
        <h2 className={tw("text-xl font-semibold mb-2")}>Payment History</h2>
        <table className={tw("table-auto w-full")}>
          <thead>
            <tr className={tw("bg-gray-200")}>
              <th className={tw("px-4 py-2")}>Date</th>
              <th className={tw("px-4 py-2")}>Amount</th>
              <th className={tw("px-4 py-2")}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((payment, index) => (
              <tr key={index}>
                <td className={tw("border px-4 py-2")}>{formatDate(payment.date)}</td>
                <td className={tw("border px-4 py-2")}>${payment.amount}</td>
                <td className={tw("border px-4 py-2")}>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={tw("p-4 bg-white rounded-md shadow-md")}>
        <h2 className={tw("text-xl font-semibold mb-2")}>Upgrade Options</h2>
        {upgradeOptions.map((option, index) => (
          <div key={index} className={tw("mb-4 border p-4 rounded-md")}>
            <h3 className={tw("text-lg font-semibold")}>{option.tier}</h3>
            <p className={tw("text-gray-700")}>Monthly Cost: ${option.monthlyCost}</p>
            <p className={tw("text-gray-700")}>{option.description}</p>
            <button
              className={tw("bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2")}
              onClick={() => dispatch({ type: 'UPGRADE_SUBSCRIPTION', payload: { tier: option.tier, monthlyCost: option.monthlyCost } })}
            >
              Upgrade to {option.tier}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


// Tailwind CSS を Context で提供するコンポーネント
const TailwindContext = React.createContext();

const TailwindProvider = ({ children }) => {
  const tw = (className) => className; // 常にクラス名をそのまま返す簡易的な実装
  return (
    <TailwindContext.Provider value={{ tw }}>
      {children}
    </TailwindContext.Provider>
  );
};

// Tailwind CSS を使用するためのフック
const useTailwind = () => {
  return React.useContext(TailwindContext);
};


const App = () => {
  return (
    <TailwindProvider>
      <BillingDashboard />
    </TailwindProvider>
  );
};

export default App;