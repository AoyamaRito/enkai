'use client';

import React, { useState, useReducer, useCallback } from 'react';

type Item = {
  id: string;
  name: string;
  category: 'weapon' | 'armor' | 'consumable' | 'other';
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  imageUrl: string;
  price: number;
  isEquipped?: boolean;
};

type ItemAction =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item };

const itemReducer = (state: Item[], action: ItemAction): Item[] => {
  switch (action.type) {
    case 'SET_ITEMS':
      return action.payload;
    case 'UPDATE_ITEM':
      return state.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload);
    case 'ADD_ITEM':
      return [...state, action.payload];
    default:
      return state;
  }
};


const ItemInventory = () => {
  const [items, dispatch] = useReducer(itemReducer, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);



  React.useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/items'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const data: Item[] = await response.json();
        dispatch({ type: 'SET_ITEMS', payload: data });
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching items.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);


  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredItems = React.useMemo(() => {
    let filtered = items;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [items, selectedCategory, searchQuery]);

  const getItemRarityColor = (rarity: Item['rarity']): string => {
    switch (rarity) {
      case 'common':
        return 'text-gray-500';
      case 'uncommon':
        return 'text-green-500';
      case 'rare':
        return 'text-blue-500';
      case 'epic':
        return 'text-purple-500';
      case 'legendary':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetItem: Item) => {
    e.preventDefault();
    if (!draggedItem) return;


    if (draggedItem.id === targetItem.id) return;

    const reorderedItems = [...items];

    const draggedIndex = reorderedItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = reorderedItems.findIndex(item => item.id === targetItem.id);

    if (draggedIndex < 0 || targetIndex < 0) return;

    const [draggedItemMoved] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItemMoved);
    dispatch({ type: 'SET_ITEMS', payload: reorderedItems });
    setDraggedItem(null);


  }, [items, dispatch, draggedItem]);

  const handleEquip = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/equip`, { method: 'PUT' });
      if (!response.ok) {
        throw new Error('Failed to equip item');
      }
      const updatedItem: Item = await response.json();
      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });

    } catch (error: any) {
      setError(`Failed to equip ${item.name}: ${error.message}`);
    }
  };

  const handleUse = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/use`, { method: 'PUT' });
      if (!response.ok) {
        throw new Error('Failed to use item');
      }
      const updatedItem: Item = await response.json();
      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });

    } catch (error: any) {
      setError(`Failed to use ${item.name}: ${error.message}`);
    }
  };

  const handleSell = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/sell`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to sell item');
      }
      dispatch({ type: 'REMOVE_ITEM', payload: item.id });

    } catch (error: any) {
      setError(`Failed to sell ${item.name}: ${error.message}`);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleCategoryChange('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedCategory === 'weapon' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleCategoryChange('weapon')}
          >
            Weapons
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedCategory === 'armor' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleCategoryChange('armor')}
          >
            Armor
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedCategory === 'consumable' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleCategoryChange('consumable')}
          >
            Consumables
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedCategory === 'other' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleCategoryChange('other')}
          >
            Other
          </button>
        </div>

        <input
          type="text"
          placeholder="Search items..."
          className="px-4 py-2 rounded border border-gray-300"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {loading && <p>Loading items...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item)}
            className="border rounded p-2 cursor-move"
            onClick={() => handleItemClick(item)}
          >
            <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-contain" />
            <h3 className={`font-bold ${getItemRarityColor(item.rarity)}`}>{item.name}</h3>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>

      {isModalOpen && selectedItem && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded p-4 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">{selectedItem.name}</h2>
            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-48 object-contain mb-2" />
            <p className="mb-2">{selectedItem.description}</p>
            <p className={`mb-2 ${getItemRarityColor(selectedItem.rarity)}`}>Rarity: {selectedItem.rarity}</p>
            <p className="mb-2">Quantity: {selectedItem.quantity}</p>
            <p className="mb-2">Price: {selectedItem.price}</p>
            <div className="flex justify-between">
              <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => handleEquip(selectedItem)}>Equip</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleUse(selectedItem)}>Use</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => handleSell(selectedItem)}>Sell</button>
            </div>

            <button className="bg-gray-300 px-4 py-2 rounded mt-4" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemInventory;