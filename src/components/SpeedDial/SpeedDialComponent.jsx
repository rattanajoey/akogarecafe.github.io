import React, { useState } from "react";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import { NiraImage, SpeedDialContainer } from "./style";
import { useNavigate } from "react-router-dom";

const SpeedDialComponent = ({ onIconSelect }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: <ArticleIcon />, name: "Portfolio" },
    { icon: <LibraryMusicIcon />, name: "Music" },
    { icon: <HomeIcon />, name: "" },
  ];

  const handleIconClick = (iconName) => {
    if (onIconSelect) {
      onIconSelect(iconName);
    }
  };

  const handleAction = (route) => {
    navigate(route);
  };

  const imageSrc = open ? "/pieces/nira2.png" : "/pieces/nira.png";

  return (
    <SpeedDialContainer>
      <SpeedDial
        ariaLabel="SpeedDial openIcon example"
        sx={{ position: "fixed", bottom: 0, right: 48 }}
        icon={<NiraImage src={imageSrc} alt="Nira" />}
        onClick={() => setOpen((prev) => !prev)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            onClick={() => {
              handleIconClick(action.name);
              handleAction(action.name.toLowerCase());
            }}
          />
        ))}
      </SpeedDial>
    </SpeedDialContainer>
  );
};

export default SpeedDialComponent;
