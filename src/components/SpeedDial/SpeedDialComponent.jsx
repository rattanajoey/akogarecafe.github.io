import React, { useState } from "react";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import { NiraImage, SpeedDialContainer } from "./style";
import { useNavigate } from "react-router-dom";

const SpeedDialComponent = ({ onIconSelect }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const actions = [
    { icon: <ArticleIcon />, name: "Portfolio", path: "/portfolio" },
    { icon: <MovieFilterIcon />, name: "Movie Club", path: "/MovieClub" },
    { icon: <LibraryMusicIcon />, name: "Music", path: "/music" },
    { icon: <HomeIcon />, name: "Home", path: "/" },
  ];
  return (
    <SpeedDialContainer>
      <SpeedDial
        ariaLabel="Quick navigation"
        sx={{ position: "fixed", bottom: 0, right: { xs: 8, sm: 24 } }}
        icon={<NiraImage src={open ? "/pieces/nira2.png" : "/pieces/nira.png"} alt="" sx={{ width: { xs: 96, sm: 112 } }} />}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={() => {
            onIconSelect?.(action.name);
            navigate(action.path);
            setOpen(false);
          }} />
        ))}
      </SpeedDial>
    </SpeedDialContainer>
  );
};
export default SpeedDialComponent;
