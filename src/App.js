import React from 'react';
import './App.css';

function App() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Website Under Construction</h1>
      <p style={styles.paragraph}>Our site is coming soon! Stay tuned.</p>
      <div style={styles.loader}></div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  heading: {
    fontSize: '48px',
    color: '#333',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '20px',
    color: '#666',
    marginBottom: '40px',
  },
  loader: {
    border: '16px solid #f3f3f3',
    borderRadius: '50%',
    borderTop: '16px solid #3498db',
    width: '120px',
    height: '120px',
    animation: 'spin 2s linear infinite',
  },
};

// Add keyframes for loader animation
const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${keyframes}</style>`);

export default App;
