import React, { useState, useReducer } from 'react';

// 状態管理 (useState/useReducer)
const initialFormState = {
  名前: '',
  メールアドレス: '',
  お問い合わせ内容: '',
  送信済み: false,
  エラー: null,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'INPUT_CHANGE':
      return { ...state, [action.payload.name]: action.payload.value };
    case 'SUBMITTING':
      return { ...state, 送信済み: true, エラー: null };
    case 'SUBMIT_SUCCESS':
      return { ...initialFormState, 送信済み: true };
    case 'SUBMIT_ERROR':
      return { ...state, 送信済み: false, エラー: action.payload };
    default:
      return state;
  }
};

// スタイリング (インラインスタイル + Tailwind CSS)
const sectionStyle = {
  padding: '2rem',
  backgroundColor: '#f7f7f7',
  borderRadius: '0.5rem',
  marginBottom: '2rem',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  marginBottom: '1rem',
  border: '1px solid #ccc',
  borderRadius: '0.25rem',
};

const textareaStyle = {
  width: '100%',
  padding: '0.5rem',
  marginBottom: '1rem',
  border: '1px solid #ccc',
  borderRadius: '0.25rem',
  height: '150px',
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer',
};

// 型定義 (ファイル内で直接定義)
/**
 * @typedef {Object} FormState
 * @property {string} 名前
 * @property {string} メールアドレス
 * @property {string} お問い合わせ内容
 * @property {boolean} 送信済み
 * @property {string | null} エラー
 */

/**
 * @typedef {Object} InputAction
 * @property {'INPUT_CHANGE'} type
 * @property {{ name: string, value: string }} payload
 */

/**
 * @typedef {Object} SubmittingAction
 * @property {'SUBMITTING'} type
 */

/**
 * @typedef {Object} SubmitSuccessAction
 * @property {'SUBMIT_SUCCESS'} type
 */

/**
 * @typedef {Object} SubmitErrorAction
 * @property {'SUBMIT_ERROR'} type
 * @property {string} payload
 */

/**
 * @typedef {InputAction | SubmittingAction | SubmitSuccessAction | SubmitErrorAction} FormAction
 */


// ユーティリティ (各ファイルに必要な関数をコピー)
const encode = (data) => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}


const ContactSection = () => {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const handleChange = (e) => {
    dispatch({ type: 'INPUT_CHANGE', payload: { name: e.target.name, value: e.target.value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMITTING' });

    try {
      // フォーム送信処理 (Netlify Formsを想定)
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...state })
      });

      dispatch({ type: 'SUBMIT_SUCCESS' });

    } catch (error) {
      console.error("フォーム送信エラー:", error);
      dispatch({ type: 'SUBMIT_ERROR', payload: "送信に失敗しました。もう一度お試しください。" });
    }
  };


  return (
    <section style={sectionStyle} className="container mx-auto">
      <h2 className="text-2xl font-bold mb-4">お問い合わせ</h2>

      <form
        onSubmit={handleSubmit}
        name="contact"
        method="POST"
        data-netlify="true"
      >
        <input type="hidden" name="form-name" value="contact" />

        <label style={labelStyle} htmlFor="名前">名前:</label>
        <input
          style={inputStyle}
          type="text"
          id="名前"
          name="名前"
          value={state.名前}
          onChange={handleChange}
          required
        />

        <label style={labelStyle} htmlFor="メールアドレス">メールアドレス:</label>
        <input
          style={inputStyle}
          type="email"
          id="メールアドレス"
          name="メールアドレス"
          value={state.メールアドレス}
          onChange={handleChange}
          required
        />

        <label style={labelStyle} htmlFor="お問い合わせ内容">お問い合わせ内容:</label>
        <textarea
          style={textareaStyle}
          id="お問い合わせ内容"
          name="お問い合わせ内容"
          value={state.お問い合わせ内容}
          onChange={handleChange}
          required
        />

        <button style={buttonStyle} type="submit" disabled={state.送信済み}>
          {state.送信済み ? '送信中...' : '送信'}
        </button>

        {state.エラー && <p className="text-red-500 mt-2">{state.エラー}</p>}
        {state.送信済み && !state.エラー && (
          <p className="text-green-500 mt-2">送信が完了しました。ありがとうございます！</p>
        )}
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">連絡先情報</h3>
        <p>ソリスト合唱団</p>
        <p>所在地: 東京都〇〇区〇〇 1-2-3</p>
        <p>営業時間: 月曜日 - 金曜日 (10:00 - 18:00)</p>

        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">ソーシャルメディア</h3>
          <a href="#" className="mr-4 text-blue-500 hover:underline">Facebook</a>
          <a href="#" className="mr-4 text-blue-500 hover:underline">Twitter</a>
          <a href="#" className="mr-4 text-blue-500 hover:underline">Instagram</a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;