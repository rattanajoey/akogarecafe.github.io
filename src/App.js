import React, { useState } from 'react';
import './App.css';
import ShogiBoardComponent from './components/Shogi/ShogiBoardComponent';
import SpeedDialComponent from './components/SpeedDial/SpeedDialComponent';
import { Typography } from '@mui/material';

const App = () => {
  const [selectedIcon, setSelectedIcon] = useState('Home');

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
  };

  return (
    <div className="App">
      <div className='App-header'>
        <Typography variant='h4'>Akogare Cafe</Typography>
      </div>
      {selectedIcon === 'Home' && 
      <ShogiBoardComponent />}
      <SpeedDialComponent onIconSelect={handleIconSelect} /> 
    </div>
  );
};

export default App;
