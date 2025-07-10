import React, { useState, useReducer, useEffect } from 'react';
import { FaGamepad, FaUsers, FaComments } from 'react-icons/fa'; // React Icons (Tailwind compatible)
import './GameServices.css'; // Keep CSS for simple animations


// Reducer for managing game state (example)
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_SCORE':
      return { ...state, score: action.payload };
    default:
      return state;
  }
};

const GameServices = () => {
  // State for animations (example)
  const [hoveredCard, setHoveredCard] = useState(null);

  // Example Game State (managed locally)
  const [gameState, dispatch] = useReducer(gameReducer, {
    score: 0,
    level: 1,
  });

  // Type definition for a game service card
  /**
   * @typedef {object} GameServiceCardProps
   * @property {string} title - The title of the game service.
   * @property {string} description - A description of the game service.
   * @property {React.ReactNode} icon - An icon for the game service.
   * @property {string} id - A unique identifier for the card.
   */

  /**
   * GameServiceCard component
   * @param {GameServiceCardProps} props - The props for the GameServiceCard component.
   */
  const GameServiceCard = ({ title, description, icon, id }) => {
    const isHovered = hoveredCard === id;

    return (
      <div
        className={`bg-white rounded-lg shadow-md p-6 transition-transform duration-300 ease-in-out hover:scale-105 transform ${isHovered ? 'scale-110' : ''}`}
        onMouseEnter={() => setHoveredCard(id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          // Inline styling for basic appearance
          border: '1px solid #ddd',
          margin: '10px',
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    );
  };

  // Utility function to format a number (copied to this file)
  const formatNumber = (number) => {
    return number.toLocaleString();
  };

  // Effect hook for a simple animation (copied to this file)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Example: Update the score (using the reducer)
      dispatch({ type: 'UPDATE_SCORE', payload: gameState.score + 1 });
    }, 2000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [gameState.score, dispatch]);


  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Our Game Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameServiceCard
          id="controller"
          title="Immersive Gaming"
          description="Experience gaming like never before with our cutting-edge technology."
          icon={<FaGamepad />}
        />
        <GameServiceCard
          id="multiplayer"
          title="Multiplayer Mayhem"
          description="Join your friends and battle it out in epic multiplayer experiences."
          icon={<FaUsers />}
        />
        <GameServiceCard
          id="community"
          title="Community Hub"
          description="Connect with other gamers, share your experiences, and build lasting friendships."
          icon={<FaComments />}
        />
        <GameServiceCard
          id="updates"
          title="Regular Updates"
          description="We are constantly updating our games with new content and features."
          icon={<FaGamepad />}
        />
        <GameServiceCard
          id="support"
          title="24/7 Support"
          description="Our support team is available 24/7 to help you with any issues."
          icon={<FaUsers />}
        />
        <GameServiceCard
          id="leaderboards"
          title="Leaderboards"
          description="Compete with other players to climb the leaderboards and become the best."
          icon={<FaComments />}
        />
      </div>

      <div className="text-center mt-8">
        <p className="text-lg">Current Score: {formatNumber(gameState.score)}</p>
      </div>
    </div>
  );
};

export default GameServices;


/*  GameServices.css (Simple animation for card hover) */
/*  This is kept separate for ease of animation, but could be inlined */

.GameServiceCard:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}