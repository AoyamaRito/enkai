'use client';

import React, { useState, useRef, useEffect, useReducer } from 'react';

type Message = {
  sender: 'user' | 'npc';
  content: string;
  timestamp: string;
};

type State = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  newMessage: string;
};

type Action =
  | { type: 'SEND_MESSAGE' }
  | { type: 'UPDATE_MESSAGE', payload: string }
  | { type: 'ADD_MESSAGE', payload: Message }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null };

const initialState: State = {
  messages: [],
  isLoading: false,
  error: null,
  newMessage: '',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return { ...state, newMessage: '' };
    case 'UPDATE_MESSAGE':
      return { ...state, newMessage: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};


const generateRandomAvatar = () => {
  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

const formatDate = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};


const GameChat = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const npcAvatar = useRef(generateRandomAvatar()).current;

  useEffect(() => {
    scrollToBottom();
    // Simulate initial NPC message
    setTimeout(() => {
      addNpcMessage("Hello! Welcome to the game.");
    }, 500);
  }, [state.messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: e.target.value });
  };

  const sendMessage = async () => {
    if (state.newMessage.trim() === '') return;

    const newMessage: Message = {
      sender: 'user',
      content: state.newMessage,
      timestamp: formatDate(new Date()),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    dispatch({ type: 'SEND_MESSAGE' });

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call
      setTimeout(() => {
        addNpcMessage(generateNpcResponse(newMessage.content));
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 1000);

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateNpcResponse = (userMessage: string): string => {
    // Simple logic to generate different NPC responses based on the user message
    const trimmedMessage = userMessage.trim().toLowerCase();

    if (trimmedMessage.includes('hello') || trimmedMessage.includes('hi')) {
      return "Greetings, adventurer!";
    } else if (trimmedMessage.includes('quest')) {
      return "A new quest awaits you! Check your journal.";
    } else if (trimmedMessage.includes('help')) {
      return "Type 'quest' for available tasks, or 'items' for your inventory.";
    } else {
      return "Interesting... tell me more.";
    }
  };


  const addNpcMessage = (content: string) => {
    const newMessage: Message = {
      sender: 'npc',
      content: content,
      timestamp: formatDate(new Date()),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4"
      >
        {state.messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
          >
            {message.sender === 'npc' && (
              <img
                src={npcAvatar}
                alt="NPC Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
            )}

            <div className="flex flex-col">
              <div
                className={`rounded-xl p-2  ${message.sender === 'user'
                  ? 'bg-blue-200 text-right'
                  : 'bg-gray-200 text-left'
                  }`}
              >
                {message.content}
              </div>
              <span className="text-xs text-gray-500 mt-1">{message.timestamp}</span>
            </div>
            {message.sender === 'user' && (
              <img
                src="https://i.pravatar.cc/150?img=5"
                alt="User Avatar"
                className="w-8 h-8 rounded-full ml-2"
              />
            )}
          </div>
        ))}
        {state.isLoading && <div className="text-center">Loading...</div>}
        {state.error && <div className="text-red-500 text-center">{state.error}</div>}
      </div>

      <div className="p-4">
        <div className="flex">
          <input
            type="text"
            className="flex-grow border rounded-l-md py-2 px-3 focus:outline-none"
            placeholder="Type your message..."
            value={state.newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={state.isLoading}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md disabled:opacity-50"
            onClick={sendMessage}
            disabled={state.isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameChat;