import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import MomoComponent from "../Momo/MomoComponent";
import CustomTooltip from "../Tooltip/CustomTooltip";
import { initialShogiPieces, pieceInfo } from "../constants/InitialShogiPieces";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { ShogiBoardWrapper, ShogiBoard, ShogiPiece, DropZone } from "./style";

import { getValidMoves } from "../PieceMechanics";
import { calculatePosition } from "../utils";
import { IconButton } from "@mui/material";

const ShogiBoardComponent = () => {
  const [pieces, setPieces] = useState(initialShogiPieces);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedSquare, setHighlightedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState(null);

  const handlePieceClick = (piece) => {
    const moves = getValidMoves(piece, pieces, piece.playerTwo);
    setValidMoves(moves);

    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null);
      setHighlightedSquare(null);
      setValidMoves(null);
    } else {
      setSelectedPiece(piece);
      setHighlightedSquare(piece.position);
    }
  };

  const handleSquareClick = (position) => {
    if (selectedPiece) {
      if (selectedPiece.position === position) {
        setSelectedPiece(null);
        setHighlightedSquare(null);
        setValidMoves(null);
      } else if (validMoves?.includes(position)) {
        const newPieces = pieces.filter(
          (p) => p.id !== selectedPiece.id && p.position !== position
        );
        newPieces.push({ ...selectedPiece, position });

        setPieces(newPieces);
        setSelectedPiece(null);
        setHighlightedSquare(null);
        setValidMoves(null);
      }
    }
  };

  const resetBoard = () => {
    setPieces(initialShogiPieces);
    setSelectedPiece(null);
    setHighlightedSquare(null);
    setValidMoves(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 4,
        px: 2,
      }}
    >
      {/* Artistic Title */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h2"
          sx={{
            background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: "bold",
            mb: 1,
            fontSize: { xs: "2.5rem", md: "3.5rem" },
          }}
        >
          将棋 • Shogi
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontStyle: "italic",
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            mb: 2,
          }}
        >
          The Art of Japanese Chess
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.6)",
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          A thousand-year-old strategic masterpiece where captured pieces find
          new life. Click pieces to explore their movements and discover the
          depth of Japanese strategy.
        </Typography>
      </Box>

      {/* Main Game Layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "350px 1fr 350px" },
          gap: 4,
          alignItems: "start",
          maxWidth: "1400px",
          width: "100%",
        }}
      >
        {/* Left Panel - Game Instructions */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(0,0,0,0.3) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 107, 107, 0.2)",
            borderRadius: 3,
            p: 3,
            color: "white",
            display: { xs: "none", lg: "block" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#ff6b6b",
              mb: 3,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            How to Play
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}
            >
              🎯 <strong>Click any piece</strong> to see its possible moves
              highlighted in blue
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}
            >
              👆 <strong>Hover over pieces</strong> to see detailed information
              about them
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}
            >
              ✨ <strong>Click highlighted squares</strong> to move your
              selected piece
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}
            >
              🔄 <strong>Use the reset button</strong> below to start over
              anytime
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "#ff6b6b",
              mb: 2,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            What Makes Shogi Special?
          </Typography>

          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.9rem",
            }}
          >
            Unlike Western chess, captured pieces in Shogi can be brought back
            into play as your own. This "drop rule" creates incredibly dynamic
            gameplay where the tide of battle can change instantly.
          </Typography>
        </Box>

        {/* Center - Game Board */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
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
                        pointerEvents:
                          selectedPiece && validMoves ? "none" : "auto",
                        border:
                          selectedPiece?.id === piece.id
                            ? "3px solid #4ecdc4"
                            : "none",
                        borderRadius:
                          selectedPiece?.id === piece.id ? "50%" : "0",
                        boxShadow:
                          selectedPiece?.id === piece.id
                            ? "0 0 15px rgba(78, 205, 196, 0.6)"
                            : "none",
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
                            ? "rgba(78, 205, 196, 0.4)"
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
                          pieces.find((p) => p.position === highlightedSquare)
                            ?.name
                        ]?.englishName
                      } (${
                        pieceInfo[
                          pieces.find((p) => p.position === highlightedSquare)
                            ?.name
                        ]?.name || "Unknown"
                      }):`}
                      secondLine={
                        pieceInfo[
                          pieces.find((p) => p.position === highlightedSquare)
                            ?.name
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
                    pieces.find((p) => p.position === highlightedSquare)
                      ?.playerTwo
                      ? "P2"
                      : "P1"
                  }
                >
                  <div style={{ width: 0, height: 0 }} />
                </CustomTooltip>
              )}
            </ShogiBoardWrapper>

            {/* Game Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mt: 4,
              }}
            >
              <IconButton
                onClick={resetBoard}
                sx={{
                  background: "linear-gradient(45deg, #4ecdc4, #45b7d1)",
                  color: "white",
                  width: 56,
                  height: 56,
                  "&:hover": {
                    background: "linear-gradient(45deg, #45b7d1, #4ecdc4)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(78, 205, 196, 0.3)",
                }}
              >
                <RestartAltIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>
          </div>
        </Box>

        {/* Right Panel - Cultural Context */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(69, 183, 209, 0.1) 0%, rgba(0,0,0,0.3) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(69, 183, 209, 0.2)",
            borderRadius: 3,
            p: 3,
            color: "white",
            display: { xs: "none", lg: "block" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#45b7d1",
              mb: 3,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Cultural Significance
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.9)",
              fontSize: "0.9rem",
            }}
          >
            Shogi embodies Japanese philosophy in its very mechanics. The
            concept of bringing captured pieces back to fight for you reflects
            ideas of redemption, second chances, and the transformative power of
            perspective.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#45b7d1",
              mb: 2,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Historical Roots
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.9rem",
            }}
          >
            Dating back over 1,000 years, Shogi evolved from ancient Indian
            Chaturanga through Chinese Xiangqi. The Japanese added the
            revolutionary "drop rule" that makes the game uniquely dynamic.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#45b7d1",
              mb: 2,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Strategic Depth
          </Typography>

          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.9rem",
            }}
          >
            With approximately 10^226 possible games (compared to chess's
            10^120), Shogi offers nearly infinite strategic possibilities. Every
            captured piece becomes a potential future threat, keeping players
            constantly engaged.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ShogiBoardComponent;
