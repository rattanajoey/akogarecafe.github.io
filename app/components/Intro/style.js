import { styled } from '@mui/material/styles';

export const IntroContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
    overflow: 'hidden',
    position: 'relative',
  });
  
export const PuzzlePiece = styled('div')(({ theme }) => ({
    width: '100px',
    height: '100px',
    margin: '5px',
    opacity: 0,
    transform: 'scale(0) rotate(45deg)', // Start with a rotated angle
    transition: 'transform 0.5s ease, opacity 0.5s ease, rotate 0.5s ease',
    '&:nth-child(1)': {
      backgroundColor: '#e74c3c',
    },
    '&:nth-child(2)': {
      backgroundColor: '#2ecc71',
    },
    '&:nth-child(3)': {
      backgroundColor: '#f1c40f',
    },
    '&:nth-child(4)': {
      backgroundColor: '#9b59b6',
    },
  }));
  