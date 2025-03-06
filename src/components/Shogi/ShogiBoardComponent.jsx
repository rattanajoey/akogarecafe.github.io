import React, { useState } from "react";
import MomoComponent from "../Momo/MomoComponent";
import CustomTooltip from "../Tooltip/CustomTooltip";
import { initialShogiPieces, pieceInfo } from "../constants/InitialShogiPieces";
import RestartAltIcon from "@mui/icons-material/RestartAlt"; // Importing the reset icon

import { ShogiBoardWrapper, ShogiBoard, ShogiPiece, DropZone } from "./style";

import { getValidMoves } from "../PieceMechanics";
import { calculatePosition } from "../utils";
import { IconButton } from "@mui/material";

const ShogiBoardComponent = () => {
  const [pieces, setPieces] = useState(initialShogiPieces);
  const [selectedPiece, setSelectedPiece] = useState(null); // Track selected piece
  const [highlightedSquare, setHighlightedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState(null);

  const handlePieceClick = (piece) => {
    const moves = getValidMoves(piece, pieces, piece.playerTwo);
    setValidMoves(moves);

    // If the same piece is clicked again, deselect it and remove the highlight
    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null); // Deselect the piece
      setHighlightedSquare(null); // Remove highlight
      setValidMoves(null);
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
        setValidMoves(null);
      } else {
        // Move the piece to the new position
        const newPieces = pieces.map((piece) => {
          if (piece.id === selectedPiece.id) {
            return { ...piece, position }; // Move piece to the new position
          }
          return piece;
        });
        setPieces(newPieces);
        setSelectedPiece(null); // Deselect the piece after move
        setHighlightedSquare(null); // Remove highlight from squares
        setValidMoves(null); // Remove valid moves
      }
    }
  };

  // Function to reset the board
  const resetBoard = () => {
    setPieces(initialShogiPieces);
    setSelectedPiece(null);
    setHighlightedSquare(null);
    setValidMoves(null);
  };

  return (
    <div style={{ height: "100vh" }}>
      <ShogiBoardWrapper>
        <ShogiBoard>
          {pieces.map((piece) => {
            const piecePosition = calculatePosition(piece.position);
            return (
              <ShogiPiece
                key={piece.id}
                style={{
                  left: `${piecePosition.left}px`,
                  top: `${piecePosition.top}px`,
                  cursor: "pointer",
                  transform: piece.playerTwo ? "rotate(180deg)" : "none",
                }}
                onClick={() => handlePieceClick(piece)}
                onMouseEnter={() =>
                  !selectedPiece && setHighlightedSquare(piece.position)
                }
                onMouseLeave={() =>
                  !selectedPiece && setHighlightedSquare(null)
                }
                className="shogi-piece"
              >
                <img src={piece.image} alt={piece.name} />
              </ShogiPiece>
            );
          })}
          {Array.from({ length: 9 }).map((_, rowIndex) =>
            Array.from({ length: 9 }).map((_, colIndex) => {
              const position = `${String.fromCharCode(65 + colIndex)}${
                9 - rowIndex
              }`;
              return (
                <DropZone
                  key={position}
                  style={{
                    left: `${colIndex * 50}px`,
                    top: `${rowIndex * 50}px`,
                    width: "50px",
                    height: "50px",
                    backgroundColor: validMoves?.includes(position)
                      ? "rgba(173, 216, 230, 0.5)"
                      : "transparent",
                  }}
                  onClick={() => handleSquareClick(position)}
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
                text={`${
                  pieceInfo[
                    pieces.find((p) => p.position === highlightedSquare)?.name
                  ]?.englishName
                } (${
                  pieceInfo[
                    pieces.find((p) => p.position === highlightedSquare)?.name
                  ]?.name || "Unknown"
                }):`}
                secondLine={
                  pieceInfo[
                    pieces.find((p) => p.position === highlightedSquare)?.name
                  ]?.description || "No description available."
                }
                player={
                  pieces.find((p) => p.position === highlightedSquare)
                    ?.playerTwo
                    ? "P2"
                    : "P1"
                }
              />
            }
            player={
              pieces.find((p) => p.position === highlightedSquare)?.playerTwo
                ? "P2"
                : "P1"
            }
          >
            <div style={{ width: 0, height: 0 }} />
          </CustomTooltip>
        )}
      </ShogiBoardWrapper>
      <IconButton onClick={resetBoard} sx={{ mt: 2 }}>
        <RestartAltIcon />
      </IconButton>
    </div>
  );
};

export default ShogiBoardComponent;
