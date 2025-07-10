"use client";

import React, { useState, useReducer, useEffect } from 'react';

type Character = {
  name: string;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  attack: number;
  defense: number;
  skills: Skill[];
  image: string;
};

type Skill = {
  name: string;
  mpCost: number;
  damageMultiplier: number;
  effect: string;
};

type BattleState = {
  player: Character;
  enemy: Character;
  turn: 'player' | 'enemy';
  log: string[];
  isBattleOver: boolean;
  winner: 'player' | 'enemy' | null;
  damageDealt: number | null;
  skillEffect: string | null;
  loading: boolean;
  experienceGained: number | null;
  itemsGained: string[];
};

type BattleAction =
  | { type: 'ATTACK' }
  | { type: 'SKILL'; skill: Skill }
  | { type: 'ITEM'; item: string }
  | { type: 'FLEE' }
  | { type: 'ENEMY_TURN' }
  | { type: 'UPDATE_HP'; target: 'player' | 'enemy'; amount: number }
  | { type: 'UPDATE_MP'; target: 'player' | 'enemy'; amount: number }
  | { type: 'ADD_LOG'; message: string }
  | { type: 'BATTLE_OVER'; winner: 'player' | 'enemy' }
  | { type: 'DAMAGE_DEALT'; amount: number }
  | { type: 'SKILL_EFFECT'; effect: string }
  | { type: 'RESET_DAMAGE' }
  | { type: 'RESET_SKILL_EFFECT' }
  | { type: 'START_LOADING' }
  | { type: 'END_LOADING' }
  | { type: 'GAIN_REWARDS'; experience: number; items: string[] };

const initialState: BattleState = {
  player: {
    name: 'Hero',
    maxHp: 100,
    hp: 100,
    maxMp: 50,
    mp: 50,
    attack: 10,
    defense: 5,
    skills: [
      { name: 'Fireball', mpCost: 10, damageMultiplier: 2, effect: 'fire' },
      { name: 'Heal', mpCost: 8, damageMultiplier: -1.5, effect: 'heal' },
    ],
    image: '/hero.png',
  },
  enemy: {
    name: 'Goblin',
    maxHp: 70,
    hp: 70,
    maxMp: 0,
    mp: 0,
    attack: 8,
    defense: 3,
    skills: [],
    image: '/goblin.png',
  },
  turn: 'player',
  log: ['Battle started!'],
  isBattleOver: false,
  winner: null,
  damageDealt: null,
  skillEffect: null,
  loading: false,
  experienceGained: null,
  itemsGained: [],
};

const battleReducer = (state: BattleState, action: BattleAction): BattleState => {
  switch (action.type) {
    case 'ATTACK': {
      const damage = Math.max(0, state.player.attack - state.enemy.defense);
      return {
        ...state,
        damageDealt: damage,
        log: [...state.log, `Hero attacks Goblin for ${damage} damage!`],
        turn: 'enemy',
      };
    }
    case 'SKILL': {
      if (state.player.mp < action.skill.mpCost) {
        return { ...state, log: [...state.log, `Not enough MP for ${action.skill.name}!`] };
      }
      const damage = Math.max(0, (state.player.attack * action.skill.damageMultiplier) - state.enemy.defense);
      const actualDamage = damage > 0 ? damage : Math.abs(damage);
      return {
        ...state,
        damageDealt: actualDamage,
        skillEffect: action.skill.effect,
        log: [...state.log, `Hero uses ${action.skill.name} for ${actualDamage} damage!`],
        turn: 'enemy',
      };
    }
    case 'UPDATE_HP': {
      const updatedHp = Math.max(0, Math.min(state[action.target].hp + action.amount, state[action.target].maxHp));
      return { ...state, [action.target]: { ...state[action.target], hp: updatedHp } };
    }
    case 'UPDATE_MP': {
      const updatedMp = Math.max(0, Math.min(state.player.mp + action.amount, state.player.maxMp));
      return { ...state, player: { ...state.player, mp: updatedMp } };
    }
    case 'ENEMY_TURN': {
      const damage = Math.max(0, state.enemy.attack - state.player.defense);
      return {
        ...state,
        damageDealt: damage,
        log: [...state.log, `Goblin attacks Hero for ${damage} damage!`],
        turn: 'player',
      };
    }
    case 'ADD_LOG':
      return { ...state, log: [...state.log, action.message] };
    case 'BATTLE_OVER':
      return { ...state, isBattleOver: true, winner: action.winner };
    case 'DAMAGE_DEALT':
      return { ...state, damageDealt: action.amount };
    case 'SKILL_EFFECT':
      return { ...state, skillEffect: action.effect };
    case 'RESET_DAMAGE':
      return { ...state, damageDealt: null };
    case 'RESET_SKILL_EFFECT':
      return { ...state, skillEffect: null };
    case 'START_LOADING':
      return { ...state, loading: true };
    case 'END_LOADING':
      return { ...state, loading: false };
    case 'GAIN_REWARDS':
      return { ...state, experienceGained: action.experience, itemsGained: action.items };
    case 'ITEM':
      return { ...state, log: [...state.log, "Items are not implemented yet"] };
    case 'FLEE':
      return { ...state, isBattleOver: true, winner: 'enemy' };
    default:
      return state;
  }
};

const BattleSystem = () => {
  const [state, dispatch] = useReducer(battleReducer, initialState);
  const { player, enemy, turn, log, isBattleOver, winner, damageDealt, skillEffect, loading, experienceGained, itemsGained } = state;

  useEffect(() => {
    if (damageDealt !== null) {
      if (turn === 'player') {
        dispatch({ type: 'UPDATE_HP', target: 'enemy', amount: -damageDealt });
      } else {
        dispatch({ type: 'UPDATE_HP', target: 'player', amount: -damageDealt });
      }

      setTimeout(() => {
        dispatch({ type: 'RESET_DAMAGE' });
      }, 500);
    }
  }, [damageDealt, turn, dispatch]);


  useEffect(() => {
    if (player.hp === 0) {
      dispatch({ type: 'BATTLE_OVER', winner: 'enemy' });
    } else if (enemy.hp === 0) {
      dispatch({ type: 'BATTLE_OVER', winner: 'player' });
      dispatch({ type: 'GAIN_REWARDS', experience: 100, items: ['Potion'] });
    }
  }, [player.hp, enemy.hp, dispatch]);

  useEffect(() => {
    if (turn === 'enemy' && !isBattleOver) {
      setTimeout(() => {
        dispatch({ type: 'ENEMY_TURN' });
      }, 1000);
    }
  }, [turn, isBattleOver, dispatch]);

  const handleAttack = () => {
    dispatch({ type: 'ATTACK' });
  };

  const handleSkill = (skill: Skill) => {
    if (player.mp >= skill.mpCost) {
      dispatch({ type: 'SKILL', skill });
      dispatch({ type: 'UPDATE_MP', target: 'player', amount: -skill.mpCost });
    } else {
      dispatch({ type: 'ADD_LOG', message: "Not enough MP!" });
    }
  };

  const handleItem = (item: string) => {
    dispatch({ type: 'ITEM', item });
  };

  const handleFlee = () => {
    dispatch({ type: 'FLEE' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isBattleOver) {
    return (
      <div className="container mx-auto mt-10 p-5 bg-gray-100 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Battle Result</h2>
        {winner === 'player' ? (
          <>
            <p className="text-green-600 text-center">You Win!</p>
            {experienceGained !== null && (
              <p className="text-center">Gained {experienceGained} experience.</p>
            )}
            {itemsGained.length > 0 && (
              <p className="text-center">
                Gained items: {itemsGained.join(', ')}
              </p>
            )}
          </>
        ) : (
          <p className="text-red-600 text-center">You Lose!</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-5 bg-gray-100 rounded-md shadow-md">
      <h1 className="text-3xl font-bold mb-5 text-center">Battle System</h1>

      <div className="flex flex-col md:flex-row justify-between mb-5">
        <div className="w-full md:w-1/2 p-3">
          <h2 className="text-xl font-semibold mb-2">{player.name}</h2>
          <img src={player.image} alt={player.name} className="w-32 h-32 mx-auto mb-3" />
          <div className="mb-2">
            HP:
            <div className="bg-gray-300 rounded-full h-4">
              <div
                className="bg-green-500 rounded-full h-4"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm">{player.hp} / {player.maxHp}</span>
          </div>
          <div>
            MP:
            <div className="bg-gray-300 rounded-full h-4">
              <div
                className="bg-blue-500 rounded-full h-4"
                style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm">{player.mp} / {player.maxMp}</span>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-3">
          <h2 className="text-xl font-semibold mb-2">{enemy.name}</h2>
          <img src={enemy.image} alt={enemy.name} className="w-32 h-32 mx-auto mb-3" />
          <div>
            HP:
            <div className="bg-gray-300 rounded-full h-4">
              <div
                className="bg-green-500 rounded-full h-4"
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm">{enemy.hp} / {enemy.maxHp}</span>
          </div>
        </div>
      </div>

      {damageDealt !== null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-4xl font-bold animate-fade-out">
          -{damageDealt}
        </div>
      )}

      {skillEffect && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold ${skillEffect === 'fire' ? 'bg-red-500' : 'bg-green-500'} p-3 rounded-md`}>
          {skillEffect}
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-lg font-semibold mb-2">Actions</h3>
        {turn === 'player' ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={handleAttack} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Attack
            </button>
            {player.skills.map((skill) => (
              <button key={skill.name} onClick={() => handleSkill(skill)} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" disabled={player.mp < skill.mpCost}>
                {skill.name} ({skill.mpCost} MP)
              </button>
            ))}
             <button onClick={() => handleItem("potion")} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              Item
            </button>
            <button onClick={handleFlee} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Flee
            </button>
          </div>
        ) : (
          <p>Enemy's Turn...</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Battle Log</h3>
        <div className="h-40 overflow-y-auto bg-gray-200 p-2 rounded">
          {log.map((message, index) => (
            <p key={index} className="text-sm">{message}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleSystem;