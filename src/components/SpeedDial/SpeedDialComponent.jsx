import React, { useState } from 'react';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import HomeIcon from '@mui/icons-material/Home';
import { NiraImage, SpeedDialContainer } from './style';

const SpeedDialComponent = ({ onIconSelect }) => {
  const [open, setOpen] = useState(false); 

  const actions = [
    { icon: <LibraryMusicIcon />, name: 'Music' },
    { icon: <HomeIcon />, name: 'Home' },
  ];

  const handleIconClick = (iconName) => {
    if (onIconSelect) {
      onIconSelect(iconName); 
    }
  };

  const imageSrc = open ? '/pieces/nira2.png' : '/pieces/nira.png';

  return (
    <SpeedDialContainer>
      <SpeedDial
        ariaLabel="SpeedDial openIcon example"
        sx={{ position: 'absolute', bottom: 48, right: 48 }}
        icon={<NiraImage src={imageSrc} alt='Nira' />}
        onClick={() => setOpen((prev) => !prev)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleIconClick(action.name)} 
          />
        ))}
      </SpeedDial>
    </SpeedDialContainer>
  );
};

export default SpeedDialComponent;
