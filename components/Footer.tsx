import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#f0f0f0',
    padding: '20px',
    textAlign: 'center',
    marginTop: '20px',
  };

  const linkStyle = {
    margin: '0 10px',
    color: '#333',
    textDecoration: 'none',
  };

  return (
    <footer style={footerStyle}>
      <div>
        株式会社ソリスト合唱団
      </div>
      <div>
        <a style={linkStyle} href="#">サービス</a>
        <a style={linkStyle} href="#">プライバシーポリシー</a>
        <a style={linkStyle} href="#">利用規約</a>
      </div>
      <div>
        &copy; 2025 Sorisuto Chorus Group
      </div>
    </footer>
  );
};

export default Footer;