import React, { useState } from "react";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import WorkIcon from "@mui/icons-material/Work";
import { useRouter } from "next/navigation";

const SpeedDialComponent = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const actions = [
    { icon: <HomeIcon />, name: "Home", onClick: () => router.push("/") },
    { icon: <MusicNoteIcon />, name: "Music", onClick: () => router.push("/music") },
    { icon: <WorkIcon />, name: "Portfolio", onClick: () => router.push("/portfolio") },
  ];

  return (
    <SpeedDial
      ariaLabel="Navigation SpeedDial"
      sx={{ position: "fixed", bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={() => {
            action.onClick();
            handleClose();
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default SpeedDialComponent; 