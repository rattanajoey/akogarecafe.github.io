import React, { useState } from "react";
import "./App.css";
import ShogiBoardComponent from "./components/Shogi/ShogiBoardComponent";
import SpeedDialComponent from "./components/SpeedDial/SpeedDialComponent";
import MusicSection from "./components/Music/MusicSection";
import HeaderComponent from "./components/Header/HeaderComponent";

const App = () => {
  const [selectedIcon, setSelectedIcon] = useState("Home");

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
  };

  return (
    <div className="App">
      <HeaderComponent />
      <div className="cursor"></div>
      <div className="follower"></div>
      {selectedIcon === "Home" && <ShogiBoardComponent />}
      {selectedIcon === "Music" && <MusicSection />}
      <SpeedDialComponent onIconSelect={handleIconSelect} />
    </div>
  );
};

export default App;
