import { Box } from '@mui/material';
import { styled } from '@mui/system';

export const MomoContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width: '300px', // Adjust width as needed
  });
  
  export const MomoImage = styled('img')({
    width: '120px', // Size of Momo's image
    height: 'auto',
  });
  
  export const SpeechBubble = styled(Box)(({ player }) => ({
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '1px solid white',
    padding: '10px',
    maxWidth: '200px',
    color: '#000',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Added subtle box shadow
    '&::after': {
      content: '""',
      position: 'absolute',
      top: player === 'P2' ? '85%' : '73%',
      [player === 'P2' ? 'left' : 'right']: '-10px',
      width: '0',
      height: '0',
      border: '10px solid transparent',
      borderRightColor: 'white',
      borderLeft: '0',
      marginTop: '-10px',
      transform: player === 'P2' ? 'none' : 'rotate(180deg)',
    },
  }));