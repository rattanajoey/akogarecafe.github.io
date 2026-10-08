import React, { useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import MomoComponent from "../Momo/MomoComponent";
import CustomTooltip from "../Tooltip/CustomTooltip";
import {
  initialShogiPieces,
  pieceInfo,
} from "../constants/InitialShogiPieces";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PromotionModal from "./PromotionModal";

import { ShogiBoardWrapper, ShogiBoard, ShogiPiece, DropZone } from "./style";

import { getValidMoves } from "../PieceMechanics";
import { calculatePosition } from "../utils";
import { IconButton } from "@mui/material";
import { getPromotionForMove } from "./promotion";

const ShogiBoardComponent = () => {
  const showHoverInfo = useMediaQuery("(hover: hover) and (min-width: 600px)");
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
        const promotion = getPromotionForMove(currentSelectedPiece, position);
        if (promotion) {
          setPromotionModal({
            open: true,
            piece: movedPiece,
            mandatory: promotion.mandatory,
          });
          newPieces.push(movedPiece);
          setPieces(newPieces);
          setSelectedPiece(null);
          setHighlightedSquare(null);
          setValidMoves(null);
          return;
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
        pb: 14,
      }}
    >
      {/* Artistic Title */}
      <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 6 } }}>
        <Typography
          variant="h2"
          component="h1"
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
          component="p"
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
          Practice Shogi piece movements and promotions. Select a piece, then
          choose a highlighted square. This practice board doesn’t enforce turns,
          check, or captured-piece drops.
        </Typography>
      </Box>

      {/* Main Game Layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", xl: "300px minmax(0, 1fr) 300px" },
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
            display: { xs: "none", xl: "block" },
          }}
        >
          <Typography
            variant="h6"
            component="h2"
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
            component="h2"
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
          <div style={{ position: "relative", width: "100%" }}>
            <ShogiBoardWrapper>
              <ShogiBoard>
                {pieces.map((piece) => {
                  const piecePosition = calculatePosition(piece.position);
                  return (
                    <CustomTooltip
                      key={piece.id}
                      describeChild
                      open={showHoverInfo && highlightedSquare === piece.position && !promotionModal.open}
                      player={piece.playerTwo ? "P2" : "P1"}
                      title={<MomoComponent
                        text={`${pieceInfo[piece.name]?.englishName || piece.name}:`}
                        secondLine={pieceInfo[piece.name]?.description || ""}
                        player={piece.playerTwo ? "P2" : "P1"}
                      />}
                    >
                    <ShogiPiece
                      type="button"
                      aria-label={`${piece.playerTwo ? "Player two" : "Player one"} ${pieceInfo[piece.name]?.englishName || piece.name} at ${piece.position}`}
                      aria-pressed={selectedPiece?.id === piece.id}
                      style={{
                        left: `${piecePosition.left / 450 * 100}%`,
                        top: `${piecePosition.top / 450 * 100}%`,
                        cursor: "pointer",
                        transform: piece.playerTwo ? "rotate(180deg)" : "none",
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
                      onClick={() => validMoves?.includes(piece.position)
                        ? handleSquareClick(piece.position)
                        : handlePieceClick(piece)}
                      onFocus={() => setHighlightedSquare(piece.position)}
                      onBlur={() => !selectedPiece && setHighlightedSquare(null)}
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
                    </CustomTooltip>
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
                        type="button"
                        aria-label={`Move to ${position}`}
                        disabled={!validMoves?.includes(position)}
                        aria-hidden={!validMoves?.includes(position)}
                        style={{
                          left: `${colIndex / 9 * 100}%`,
                          top: `${rowIndex / 9 * 100}%`,
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
            </ShogiBoardWrapper>

            {!showHoverInfo && selectedPiece && (
              <Box role="status" sx={{ color: "white", textAlign: "center", mt: 2, px: 2 }}>
                <Typography fontWeight="bold">{pieceInfo[selectedPiece.name]?.englishName || selectedPiece.name}</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>{pieceInfo[selectedPiece.name]?.description}</Typography>
              </Box>
            )}
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
                aria-label="Reset Shogi board"
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
            display: { xs: "none", xl: "block" },
          }}
        >
          <Typography
            variant="h6"
            component="h2"
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
            component="h2"
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
