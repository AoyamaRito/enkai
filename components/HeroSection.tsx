import React from 'react';

const HeroSection = () => {
  // Inline styles for the gradient background and animations
  const heroStyle = {
    background: 'linear-gradient(45deg, #FF6B6B, #4F86C6, #77DD77)', // Example gradient colors
    padding: '5rem 2rem',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    animation: 'gradientAnimation 10s infinite alternate',
  };

  const buttonStyle = {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    margin: '1rem',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)',
    },
  };

  // Keyframes for the gradient animation (defined inline)
  const gradientAnimationKeyframes = `
    @keyframes gradientAnimation {
      0% {
        background-position: 0% 50%;
      }
      100% {
        background-position: 100% 50%;
      }
    }
  `;

  // Function to create music note animation elements
  const createMusicNotes = () => {
    const notes = [];
    for (let i = 0; i < 10; i++) {
      const size = Math.random() * 30 + 10; // Random size between 10 and 40
      const x = Math.random() * 100; // Random horizontal position
      const animationDuration = Math.random() * 5 + 3; // Random animation duration
      const noteStyle = {
        position: 'absolute',
        top: `${Math.random() * 100}%`,
        left: `${x}%`,
        fontSize: `${size}px`,
        color: 'rgba(255, 255, 255, 0.5)',
        animation: `float ${animationDuration}s linear infinite`,
        zIndex: 1,
      };

      const floatKeyframes = `
        @keyframes float {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
      `;

      notes.push(
        <span key={i} style={noteStyle}>
          ♪
          <style>{floatKeyframes}</style>
        </span>
      );
    }
    return notes;
  };

  return (
    <div style={heroStyle} className="relative overflow-hidden">
      <style>{gradientAnimationKeyframes}</style>
      {createMusicNotes()}
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-4">株式会社ソリスト合唱団</h1>
        <p className="text-lg mb-6">ゲームと教育サービスで人と人をつなぐ</p>
        <div>
          <button style={buttonStyle} className="bg-white text-blue-600 hover:bg-gray-100">
            サービスを見る
          </button>
          <button style={buttonStyle} className="bg-blue-600 text-white hover:bg-blue-700">
            お問い合わせ
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;