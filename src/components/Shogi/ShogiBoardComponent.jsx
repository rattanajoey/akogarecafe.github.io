import React, { useState } from 'react';
import MomoComponent from '../Momo/MomoComponent';
import CustomTooltip from '../Tooltip/CustomTooltip';
import { ShogiBoardWrapper, ShogiBoard, ShogiPiece, DropZone } from './style'; // Import styled components
import { initialShogiPieces, pieceInfo } from '../constants/InitialShogiPieces';


const ShogiBoardComponent = () => {
  const [pieces, setPieces] = useState(initialShogiPieces);
  const [selectedPiece, setSelectedPiece] = useState(null); // Track selected piece
  const [highlightedSquare, setHighlightedSquare] = useState(null); // Highlight square where piece will go
  // Handle selecting a piece
  const handlePieceClick = (piece) => {
    // If the same piece is clicked again, deselect it and remove the highlight
    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null); // Deselect the piece
      setHighlightedSquare(null); // Remove highlight
    } else {
      setSelectedPiece(piece); // Select the new piece
      setHighlightedSquare(piece.position); // Highlight the current position of the piece
    }
  };

  // Handle selecting a square to drop the piece
  const handleSquareClick = (position) => {
    if (selectedPiece) {
      if (selectedPiece.position === position) {
        setSelectedPiece(null); // Deselect piece if clicked on the same square
        setHighlightedSquare(null); // Remove highlight
      } else {
        // Move the piece to the new position
        const newPieces = pieces.map(piece => {
          if (piece.id === selectedPiece.id) {
            return { ...piece, position }; // Move piece to the new position
          }
          return piece;
        });
        setPieces(newPieces);
        setSelectedPiece(null); // Deselect the piece after move
        setHighlightedSquare(null); // Remove highlight from squares
      }
    }
  };  

  // Calculate the position of each piece on the board
  const calculatePosition = (position) => {
    const col = position.charCodeAt(0) - 65; // Convert column letter (A-I) to index (0-8)
    const row = 9 - parseInt(position[1]); // Convert row number (1-9) to index (0-8)
    return { left: col * 50, top: row * 50 };
  };

  return (
    <ShogiBoardWrapper>
      <ShogiBoard>
        {pieces.map(piece => {
          const piecePosition = calculatePosition(piece.position);
          return (
            <ShogiPiece
              key={piece.id}
              style={{
                left: `${piecePosition.left}px`,
                top: `${piecePosition.top}px`,
                cursor: 'pointer',
                transform: piece.playerTwo ? 'rotate(180deg)' : 'none',
              }}
              onClick={() => handlePieceClick(piece)} // Click to select piece
              onMouseEnter={() => !selectedPiece && setHighlightedSquare(piece.position)} // Only show tooltip on hover if no piece is selected
              onMouseLeave={() => !selectedPiece && setHighlightedSquare(null)} // Only hide tooltip if no piece selected
            >
              <img src={piece.image} alt={piece.name} />
            </ShogiPiece>
          );
        })}
        {/* Create drop zones for each square */}
        {Array.from({ length: 9 }).map((_, rowIndex) =>
          Array.from({ length: 9 }).map((_, colIndex) => {
            const position = `${String.fromCharCode(65 + colIndex)}${9 - rowIndex}`;
            return (
              <DropZone
                key={position}
                style={{
                  left: `${colIndex * 50}px`,
                  top: `${rowIndex * 50}px`,
                  width: '50px',
                  height: '50px',
                  backgroundColor: highlightedSquare === position ? 'rgba(0, 255, 0, 0.5)' : 'transparent', // Highlight target square
                }}
                onClick={() => handleSquareClick(position)} // Click to move piece
              />
            );
          })
        )}
      </ShogiBoard>
      {highlightedSquare && (
        <CustomTooltip
          open={true}
          title={
            <MomoComponent 
              text={`${pieceInfo[pieces.find(p => p.position === highlightedSquare)?.name]?.englishName} (${pieceInfo[pieces.find(p => p.position === highlightedSquare)?.name]?.name || 'Unknown'}):`}
              secondLine={pieceInfo[pieces.find(p => p.position === highlightedSquare)?.name]?.description || 'No description available.'}
              player={pieces.find(p => p.position === highlightedSquare)?.playerTwo ? 'P2' : 'P1'}
            />
          }
          player={pieces.find(p => p.position === highlightedSquare)?.playerTwo ? 'P2' : 'P1'}
        >
        </CustomTooltip>
      )}
    </ShogiBoardWrapper>
  );
};

export default ShogiBoardComponent;
