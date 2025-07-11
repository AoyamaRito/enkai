'use client';

import { useState, useReducer, ChangeEvent, useCallback } from 'react';

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
}

type Action =
  | { type: 'ADD_ITEM'; text: string }
  | { type: 'TOGGLE_ITEM'; id: string }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'FILTER_ITEMS'; filterText: string };

const generateId = () => Math.random().toString(36).substring(2, 15);

const reducer = (state: ListItem[], action: Action): ListItem[] => {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, { id: generateId(), text: action.text, completed: false }];
    case 'TOGGLE_ITEM':
      return state.map(item =>
        item.id === action.id ? { ...item, completed: !item.completed } : item
      );
    case 'DELETE_ITEM':
      return state.filter(item => item.id !== action.id);
    case 'FILTER_ITEMS':
      const filterText = action.filterText.toLowerCase();
      return state.map(item => ({
        ...item,
        filteredOut: !item.text.toLowerCase().includes(filterText),
      }));
    default:
      return state;
  }
};

interface ListComponentProps {}

const ListComponent: React.FC<ListComponentProps> = () => {
  const [state, dispatch] = useReducer(reducer, []);
  const [newItemText, setNewItemText] = useState('');
  const [filterText, setFilterText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback(() => {
    if (newItemText.trim() === '') return;
    setIsLoading(true);
    setError(null);

    // Simulate async operation
    setTimeout(() => {
      try {
        dispatch({ type: 'ADD_ITEM', text: newItemText });
        setNewItemText('');
        setIsLoading(false);
      } catch (e: any) {
        setError(e.message || 'Failed to add item.');
        setIsLoading(false);
      }

    }, 500); // Simulate network latency

  }, [newItemText, dispatch]);

  const toggleItem = (id: string) => dispatch({ type: 'TOGGLE_ITEM', id });

  const deleteItem = (id: string) => dispatch({ type: 'DELETE_ITEM', id });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewItemText(e.target.value);
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFilterText = e.target.value;
    setFilterText(newFilterText);
    dispatch({ type: 'FILTER_ITEMS', filterText: newFilterText });
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My List</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Add new item"
          value={newItemText}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
          onClick={addItem}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter items"
          value={filterText}
          onChange={handleFilterChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <ul>
        {state.map(item => (
          !item.filteredOut &&
          <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
            <div>
              <button
                onClick={() => toggleItem(item.id)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
              >
                {item.completed ? 'Undo' : 'Complete'}
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListComponent;