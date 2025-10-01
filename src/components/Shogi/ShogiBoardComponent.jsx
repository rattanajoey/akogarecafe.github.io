import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import MomoComponent from "../Momo/MomoComponent";
import CustomTooltip from "../Tooltip/CustomTooltip";
import {
  initialShogiPieces,
  pieceInfo,
  promotionRules,
} from "../constants/InitialShogiPieces";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PromotionModal from "./PromotionModal";

import { ShogiBoardWrapper, ShogiBoard, ShogiPiece, DropZone } from "./style";

import { getValidMoves } from "../PieceMechanics";
import { calculatePosition } from "../utils";
import { IconButton } from "@mui/material";

const ShogiBoardComponent = () => {
  const [pieces, setPieces] = useState(initialShogiPieces);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedSquare, setHighlightedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState(null);
  const [promotionModal, setPromotionModal] = useState({
    open: false,
    piece: null,
  });

  const handlePieceClick = (piece) => {
    // Find the current piece data from the pieces state to ensure we have the latest data
    const currentPiece = pieces.find((p) => p.id === piece.id) || piece;
    const moves = getValidMoves(currentPiece, pieces, currentPiece.playerTwo);
    setValidMoves(moves);

    if (selectedPiece?.id === currentPiece.id) {
      setSelectedPiece(null);
      setHighlightedSquare(null);
      setValidMoves(null);
    } else {
      setSelectedPiece(currentPiece);
      setHighlightedSquare(currentPiece.position);
    }
  };

  const handleSquareClick = (position) => {
    if (selectedPiece) {
      // Get the current piece data from state to ensure we have the latest data
      const currentSelectedPiece =
        pieces.find((p) => p.id === selectedPiece.id) || selectedPiece;

      if (currentSelectedPiece.position === position) {
        setSelectedPiece(null);
        setHighlightedSquare(null);
        setValidMoves(null);
      } else if (validMoves?.includes(position)) {
        // Remove the moving piece and any piece at the target position (capture)
        const newPieces = pieces.filter(
          (p) => p.id !== currentSelectedPiece.id && p.position !== position
        );

        const movedPiece = { ...currentSelectedPiece, position };

        // Check for promotion opportunity
        const promotionRule = promotionRules[currentSelectedPiece.name];
        if (promotionRule) {
          const promotionZone = currentSelectedPiece.playerTwo
            ? promotionRule.playerTwoPromotionZone
            : promotionRule.promotionZone;

          const mandatoryPromotionZone = currentSelectedPiece.playerTwo
            ? promotionRule.playerTwoMandatoryPromotionZone
            : promotionRule.mandatoryPromotionZone;

          if (promotionZone.includes(position)) {
            // Check if promotion is mandatory
            const isMandatory =
              mandatoryPromotionZone &&
              mandatoryPromotionZone.includes(position);

            // Show promotion modal with the moved piece
            setPromotionModal({
              open: true,
              piece: movedPiece,
              mandatory: isMandatory,
            });

            // Add the moved piece to the board immediately
            newPieces.push(movedPiece);
            setPieces(newPieces);
            return;
          }
        }

        newPieces.push(movedPiece);
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
    setPromotionModal({ open: false, piece: null });
  };

  const handlePromotion = (pieceId, promotedName, promotedImage) => {
    setPieces((currentPieces) => {
      const newPieces = currentPieces.map((piece) =>
        piece.id === pieceId
          ? { ...piece, name: promotedName, image: promotedImage }
          : piece
      );
      return newPieces;
    });
    // Clear the promotion modal state to prevent handlePromotionModalClose from running
    setPromotionModal({ open: false, piece: null });
    setSelectedPiece(null);
    setHighlightedSquare(null);
    setValidMoves(null);
  };

  const handlePromotionModalClose = () => {
    // Only complete the move if the modal is closed without promoting
    // (i.e., if the piece hasn't been promoted yet)
    if (promotionModal.piece) {
      const currentPiece = pieces.find((p) => p.id === promotionModal.piece.id);
      // Only add the piece if it hasn't been promoted (still has original name)
      if (currentPiece && currentPiece.name === promotionModal.piece.name) {
        const newPieces = pieces.filter(
          (p) =>
            p.id !== promotionModal.piece.id &&
            p.position !== promotionModal.piece.position
        );
        newPieces.push(promotionModal.piece);
        setPieces(newPieces);
      }
    }
    setPromotionModal({ open: false, piece: null });
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
              "linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(0,0,0,0.3) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 182, 193, 0.2)",
            borderRadius: 3,
            p: 3,
            color: "white",
            display: { xs: "none", lg: "block" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#ffb6c1",
              mb: 3,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            🌸 3-gatsu no Lion
          </Typography>

          <Box
            sx={{
              textAlign: "center",
              mb: 3,
            }}
          >
            {/* Manga Cover Image - Clickable */}
            <Box
              component="a"
              href="https://amzn.to/3VNpLpF"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "block",
                mb: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  filter: "brightness(1.1)",
                },
              }}
            >
              <Box
                component="img"
                src="/manga/march_comes_like_a_lion_1.jpg"
                alt="3-gatsu no Lion Volume 1 Cover"
                sx={{
                  width: "120px",
                  height: "160px",
                  margin: "0 auto",
                  borderRadius: 2,
                  boxShadow: "0 4px 15px rgba(255, 182, 193, 0.3)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  objectFit: "cover",
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.9rem",
                fontStyle: "italic",
                mb: 2,
              }}
            >
              "March Comes in Like a Lion"
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
              }}
            >
              The beautiful anime that brought Shogi to life through the story
              of Rei Kiriyama, a young professional Shogi player navigating
              loneliness, family, and the profound beauty of the game.
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "#ffb6c1",
              mb: 2,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Why It Matters
          </Typography>

          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.9rem",
              mb: 3,
            }}
          >
            This series beautifully captures the emotional depth of Shogi, how
            each move reflects the player's inner world, how the game connects
            people across generations, and how strategy becomes poetry.
          </Typography>

          <Box
            sx={{
              textAlign: "center",
              mt: 3,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#ffb6c1",
                fontSize: "0.9rem",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Experience the Series
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Watch the anime or read the manga to see how Shogi becomes a
              metaphor for life itself, every decision, every connection, every
              moment of growth reflected in the pieces on the board.
            </Typography>

            <Box
              component="a"
              href="https://amzn.to/3VNpLpF"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-block",
                background: "linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%)",
                color: "white",
                textDecoration: "none",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(255, 182, 193, 0.4)",
                  textDecoration: "none",
                  color: "white",
                },
              }}
            >
              📚 Read Volume 1
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Promotion Modal */}
      <PromotionModal
        open={promotionModal.open}
        onClose={handlePromotionModalClose}
        onPromote={handlePromotion}
        piece={promotionModal.piece}
        mandatory={promotionModal.mandatory}
      />
    </Box>
  );
};

export default ShogiBoardComponent;
