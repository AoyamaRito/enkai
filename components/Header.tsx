import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Tailwind CSS styles (inline)
  const containerStyle = {
    backgroundColor: '#f0f0f0',
    padding: '1rem',
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  };

  const menuListStyle = {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  const menuItemStyle = {
    marginRight: '1rem',
  };

  const mobileMenuButtonStyle = {
    display: 'none', // Initially hidden
  };

  const mobileMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: '1rem',
    display: isMenuOpen ? 'block' : 'none',
    zIndex: 10, // Ensure it's above other content
  };

  // Media query for mobile responsiveness (Tailwind-like syntax directly in JSX)
  const mediaQuery = `@media (max-width: 768px)`;

  const mobileNavStyle = {
    ...navStyle,
    [mediaQuery]: {
      display: 'block', // Stack elements vertically on mobile
    },
  };

  const mobileLogoStyle = {
    ...logoStyle,
    [mediaQuery]: {
      marginBottom: '1rem',
      textAlign: 'center',
    },
  };

  const mobileMenuListStyle = {
    ...menuListStyle,
    [mediaQuery]: {
      display: 'none', // Hide the desktop menu on mobile
    },
  };

  const mobileMenuItemStyle = {
    ...menuItemStyle,
    [mediaQuery]: {
      marginBottom: '0.5rem',
    },
  };

  const mobileMenuButtonStyleOverride = {
    ...mobileMenuButtonStyle,
    [mediaQuery]: {
      display: 'block', // Show the hamburger button on mobile
      cursor: 'pointer',
    },
  };


  return (
    <header style={containerStyle}>
      <nav style={navStyle}>
        <div style={logoStyle}>ソリスト合唱団 (Logo Placeholder)</div>

        <ul style={menuListStyle}>
          <li style={menuItemStyle}><a href="#">ホーム</a></li>
          <li style={menuItemStyle}><a href="#">サービス</a></li>
          <li style={menuItemStyle}><a href="#">ゲーム事業</a></li>
          <li style={menuItemStyle}><a href="#">教育事業</a></li>
          <li style={menuItemStyle}><a href="#">会社概要</a></li>
          <li style={menuItemStyle}><a href="#">お問い合わせ</a></li>
        </ul>

        {/* Hamburger Menu Button (Mobile) */}
        <div style={mobileMenuButtonStyleOverride} onClick={toggleMenu}>
          ☰
        </div>
      </nav>

      {/* Mobile Menu (Hidden by default) */}
      <div style={mobileMenuStyle}>
        <ul>
          <li style={{marginBottom: '0.5rem'}}><a href="#">ホーム</a></li>
          <li style={{marginBottom: '0.5rem'}}><a href="#">サービス</a></li>
          <li style={{marginBottom: '0.5rem'}}><a href="#">ゲーム事業</a></li>
          <li style={{marginBottom: '0.5rem'}}><a href="#">教育事業</a></li>
          <li style={{marginBottom: '0.5rem'}}><a href="#">会社概要</a></li>
          <li style={{marginBottom: '0.5rem'}}><a href="#">お問い合わせ</a></li>
        </ul>
      </div>
    </header>
  );
};

export default Header;