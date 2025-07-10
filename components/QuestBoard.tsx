"use client";

import { useState, useReducer, useEffect } from "react";

type Quest = {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  status: "pending" | "in_progress" | "completed";
  reward: string;
  deadline?: string; // ISO Date String
};

type Filter = "all" | "pending" | "in_progress" | "completed";
type Sort = "difficulty" | "deadline";

type Action =
  | { type: "SET_QUESTS"; payload: Quest[] }
  | { type: "UPDATE_QUEST"; payload: Quest }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_FILTER"; payload: Filter }
  | { type: "SET_SORT"; payload: Sort };

type State = {
  quests: Quest[];
  loading: boolean;
  error: string | null;
  filter: Filter;
  sort: Sort;
};

const initialState: State = {
  quests: [],
  loading: true,
  error: null,
  filter: "all",
  sort: "difficulty",
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_QUESTS":
      return { ...state, quests: action.payload, loading: false, error: null };
    case "UPDATE_QUEST":
      return {
        ...state,
        quests: state.quests.map((quest) =>
          quest.id === action.payload.id ? action.payload : quest
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "SET_SORT":
      return { ...state, sort: action.payload };
    default:
      return state;
  }
};

const fetchQuests = async (): Promise<Quest[]> => {
  // Dummy data for now.  Replace with actual API call.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "Gather Herbs",
          description: "Collect 10 herbs from the forest.",
          difficulty: 1,
          status: "pending",
          reward: "50 Gold",
        },
        {
          id: "2",
          title: "Slay the Dragon",
          description: "Defeat the fearsome dragon guarding the mountain pass.",
          difficulty: 5,
          status: "in_progress",
          reward: "Legendary Sword",
          deadline: new Date(Date.now() + 86400000).toISOString() // 1 day
        },
        {
          id: "3",
          title: "Deliver Package",
          description: "Deliver a package to the village elder.",
          difficulty: 2,
          status: "completed",
          reward: "100 Gold",
        },
      ]);
    }, 500);
  });
};

const QuestBoard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  useEffect(() => {
    const loadQuests = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const quests = await fetchQuests();
        dispatch({ type: "SET_QUESTS", payload: quests });
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message || "Failed to fetch quests." });
      }
    };

    loadQuests();
  }, []);


  const handleAcceptQuest = async (questId: string) => {
    try {
      const updatedQuest: Quest = {
        ...state.quests.find((q) => q.id === questId)!,
        status: "in_progress",
      };

      dispatch({ type: "UPDATE_QUEST", payload: updatedQuest });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message || "Failed to accept quest." });
    }
  };

  const handleAbandonQuest = async (questId: string) => {
    try {
       const updatedQuest: Quest = {
        ...state.quests.find((q) => q.id === questId)!,
        status: "pending",
      };

      dispatch({ type: "UPDATE_QUEST", payload: updatedQuest });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message || "Failed to abandon quest." });
    }
  };

  const filteredQuests = state.quests.filter((quest) => {
    if (state.filter === "all") return true;
    return quest.status === state.filter;
  });

  const sortedQuests = [...filteredQuests].sort((a, b) => {
    if (state.sort === "difficulty") {
      return a.difficulty - b.difficulty;
    } else if (state.sort === "deadline") {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  const QuestItem = ({ quest }: { quest: Quest }) => {
    const [countdown, setCountdown] = useState<string | null>(null);

    useEffect(() => {
      if (quest.deadline && quest.status === 'in_progress') {
        const intervalId = setInterval(() => {
          const deadlineDate = new Date(quest.deadline!);
          const now = new Date();
          const timeLeft = deadlineDate.getTime() - now.getTime();

          if (timeLeft <= 0) {
            setCountdown("Expired!");
            clearInterval(intervalId);
          } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          }
        }, 1000);

        return () => clearInterval(intervalId);
      } else {
        setCountdown(null);
      }
    }, [quest.deadline, quest.status]);

    return (
      <li
        key={quest.id}
        className="border p-4 rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
        onClick={() => setSelectedQuestId(quest.id)}
      >
        <h3 className="text-lg font-semibold">{quest.title}</h3>
        <div className="flex items-center space-x-2">
          {[...Array(quest.difficulty)].map((_, i) => (
            <span key={i} className="text-yellow-500">
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">Status: {quest.status}</p>
         {countdown && <p className="text-red-500">Deadline: {countdown}</p>}
      </li>
    );
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quest Board</h1>

      {state.error && <div className="text-red-500 mb-4">{state.error}</div>}

      <div className="flex space-x-4 mb-4">
        <select
          value={state.filter}
          onChange={(e) => dispatch({ type: "SET_FILTER", payload: e.target.value as Filter })}
          className="border rounded-md p-2"
        >
          <option value="all">All Quests</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={state.sort}
          onChange={(e) => dispatch({ type: "SET_SORT", payload: e.target.value as Sort })}
          className="border rounded-md p-2"
        >
          <option value="difficulty">Difficulty</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>

      {state.loading ? (
        <p>Loading quests...</p>
      ) : (
        <ul className="space-y-4">
          {sortedQuests.map((quest) => (
            <QuestItem key={quest.id} quest={quest} />
          ))}
        </ul>
      )}

      {selectedQuestId && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-md p-4 w-full max-w-md">
            {state.loading ? (
              <p>Loading quest details...</p>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-2">
                  {state.quests.find((q) => q.id === selectedQuestId)?.title}
                </h2>
                <p className="mb-4">
                  {state.quests.find((q) => q.id === selectedQuestId)?.description}
                </p>
                <p className="mb-4">
                  Reward: {state.quests.find((q) => q.id === selectedQuestId)?.reward}
                </p>

                {state.quests.find((q) => q.id === selectedQuestId)?.status ===
                  "pending" && (
                  <button
                    onClick={() => handleAcceptQuest(selectedQuestId)}
                    className="bg-green-500 text-white rounded-md p-2 hover:bg-green-600 mr-2"
                  >
                    Accept Quest
                  </button>
                )}
                 {state.quests.find((q) => q.id === selectedQuestId)?.status ===
                  "in_progress" && (
                  <button
                    onClick={() => handleAbandonQuest(selectedQuestId)}
                    className="bg-red-500 text-white rounded-md p-2 hover:bg-red-600 mr-2"
                  >
                    Abandon Quest
                  </button>
                )}
                <button
                  onClick={() => setSelectedQuestId(null)}
                  className="bg-gray-300 text-gray-700 rounded-md p-2 hover:bg-gray-400"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestBoard;