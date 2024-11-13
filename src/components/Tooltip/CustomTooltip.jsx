import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { Fade } from '@mui/material';

const CustomTooltip = styled(({ className, player, ...props }) => (
  <Tooltip 
    {...props} 
    classes={{ popper: className }}  
    slotProps={{
        popper: {
        modifiers: [
            {
            name: 'offset',
            options: {
                offset: [ player === 'P2' ? -610 : 150, player === 'P2' ? -250 : 100],
            },
            },
        ],
        },
    }}         
    TransitionComponent={Fade}
    TransitionProps={{ timeout: 600 }}
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'transparent',
    maxWidth: 'none',
    margin: 0,
    padding: 0,
  },
}));

export default CustomTooltip;