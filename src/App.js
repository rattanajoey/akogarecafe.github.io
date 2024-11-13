import React from 'react';
import './App.css'; // Your styles
import ShogiBoardComponent from './components/Shogi/ShogiBoardComponent';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Akogare Cafe</h1>
        <p>Play Shogi and learn more about me!</p>
      </header>
      <ShogiBoardComponent />
    </div>
  );
};

export default App;
