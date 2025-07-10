'use client';

import React, { useState, useReducer, useEffect } from 'react';

type Player = {
  name: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  equipment: string[];
  skills: string[];
  imageUrl: string;
  statPoints: number;
};

type Action =
  | { type: 'INCREASE_STAT'; stat: 'hp' | 'mp' | 'attack' | 'defense' }
  | { type: 'SET_IMAGE'; imageUrl: string }
  | { type: 'LEVEL_UP' }
  | { type: 'ADD_EXPERIENCE'; amount: number };

const reducer = (state: Player, action: Action): Player => {
  switch (action.type) {
    case 'INCREASE_STAT':
      if (state.statPoints <= 0) return state;
      const increasedValue = Math.min(state.level, state[action.stat] + 1)
      return { ...state, [action.stat]: increasedValue, statPoints: state.statPoints - 1 };
    case 'SET_IMAGE':
      return { ...state, imageUrl: action.imageUrl };
    case 'LEVEL_UP':
      return {
        ...state,
        level: state.level + 1,
        statPoints: state.statPoints + 5,
        maxHp: state.maxHp + 10,
        maxMp: state.maxMp + 5,
        hp: state.maxHp + 10,
        mp: state.maxMp + 5
      };
    case 'ADD_EXPERIENCE':
      const newExperience = state.experience + action.amount;
      const experienceNeededForLevel = state.level * 100;
      if (newExperience >= experienceNeededForLevel) {
        const remainingExperience = newExperience - experienceNeededForLevel;
        const newState = { ...state, experience: remainingExperience };
        return reducer(newState, {type: 'LEVEL_UP'});
      }
      return { ...state, experience: newExperience };
    default:
      return state;
  }
};


const initialPlayerState: Player = {
  name: 'Hero',
  level: 1,
  experience: 0,
  hp: 50,
  maxHp: 50,
  mp: 20,
  maxMp: 20,
  attack: 10,
  defense: 5,
  equipment: ['Sword', 'Shield'],
  skills: ['Bash', 'Heal'],
  imageUrl: '/default-profile.png',
  statPoints: 5,
};

function uploadImage(image: File): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('/new-image.png')
    }, 500);
  });
}

const PlayerProfile = () => {
  const [player, dispatch] = useReducer(reducer, initialPlayerState);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    try {
        const imageUrl = await uploadImage(file);
        dispatch({ type: 'SET_IMAGE', imageUrl: imageUrl });
    } catch (e: any) {
        setError(e.message || 'Image upload failed.')
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (player.level > initialPlayerState.level) {
      setLevelUpAnimation(true);
      setTimeout(() => {
        setLevelUpAnimation(false);
      }, 2000);
    }
  }, [player.level]);


  const handleAddExperience = () => {
    dispatch({ type: 'ADD_EXPERIENCE', amount: 50 });
  };

  const handleIncreaseStat = (stat: 'hp' | 'mp' | 'attack' | 'defense') => {
    dispatch({ type: 'INCREASE_STAT', stat });
  };


  return (
    <div className="min-h-screen bg-gray-100 py-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">{player.name}</h2>
            <p className={`text-lg font-bold ${levelUpAnimation ? 'text-green-500 animate-pulse' : 'text-gray-600'}`}>
              Level: {player.level}
            </p>
          </div>
          <p className="text-gray-700">Experience: {player.experience} / {player.level * 100}</p>

          <button onClick={handleAddExperience} className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Experience
          </button>

          <div className="mt-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto">
              <img src={player.imageUrl} alt="Profile" className="object-cover w-full h-full" />
              {uploading && (
                <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                  <span className="text-white">Uploading...</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2 block mx-auto" disabled={uploading}/>
              {error && <p className="text-red-500 mt-1">{error}</p>}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-700">Status</h3>
          <p>HP: {player.hp} / {player.maxHp} <button onClick={() => handleIncreaseStat('hp')} disabled={player.statPoints === 0} className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded disabled:bg-gray-400">+</button></p>
          <p>MP: {player.mp} / {player.maxMp} <button onClick={() => handleIncreaseStat('mp')} disabled={player.statPoints === 0} className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded disabled:bg-gray-400">+</button></p>
          <p>Attack: {player.attack} <button onClick={() => handleIncreaseStat('attack')} disabled={player.statPoints === 0} className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded disabled:bg-gray-400">+</button></p>
          <p>Defense: {player.defense} <button onClick={() => handleIncreaseStat('defense')} disabled={player.statPoints === 0} className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded disabled:bg-gray-400">+</button></p>
            <p>Stat Points Available: {player.statPoints}</p>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-700">Equipment</h3>
          <ul>
            {player.equipment.map((item) => (
              <li key={item} className="text-gray-600">{item}</li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-700">Skills</h3>
          <ul>
            {player.skills.map((skill) => (
              <li key={skill} className="text-gray-600">{skill}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;