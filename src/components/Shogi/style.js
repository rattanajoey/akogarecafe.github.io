import { styled } from '@mui/system';

// Outer container for the entire shogi board area
export const ShogiBoardWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundImage: 'url(/pieces/wood_texture.jpg)', // Add your wood texture background image here
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '20px', // Padding around the board for the wood effect
  borderRadius: '10px', // Optional: slightly rounded edges for the outside
  width: '450px',
  height: '450px',
  margin: 'auto',
  marginTop: '20px',
  position: 'relative',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Adds depth and elevation to the board
});

// Shogi board styling
export const ShogiBoard = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(9, 50px)',
  gridTemplateRows: 'repeat(9, 50px)',
  gap: '1px',
  width: '450px',
  height: '450px',
  position: 'relative',
  border: '5px solid #000', // Darker border for more realistic appearance
  borderRadius: '5px', // Slight rounding of the board edges
});

// Shogi piece styling
export const ShogiPiece = styled('div')({
  width: '50px',
  height: '50px',
  position: 'absolute',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2, // Ensures the pieces are above the board,
  '& img': {
    objectFit: 'cover',
    width: '40px',
    height: '40px',
  }
});

export const DropZone = styled('div')`
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.1); /* Light color for drop zones */
  border: 1px solid #000; /* Border to show the drop zone */
`;

export const HighlightCircle = styled('div')({
  position: 'absolute',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: 'rgba(0, 255, 0, 0.6)',
  pointerEvents: 'none', // Prevent blocking click events
});