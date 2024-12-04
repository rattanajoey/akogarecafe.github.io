import React, { useState } from 'react';
import ShogiBoardComponent from './components/Shogi/ShogiBoardComponent';
import SpeedDialComponent from './components/SpeedDial/SpeedDialComponent';

const App = () => {
  const [selectedIcon, setSelectedIcon] = useState('Home');

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
  };

  return (
    <div className="App">
      {selectedIcon === 'Home' && 
      <ShogiBoardComponent />}
      <SpeedDialComponent onIconSelect={handleIconSelect} /> 
    </div>
  );
};

export default App;
