import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { promotionRules, pieceInfo } from "../constants/InitialShogiPieces";

const PromotionModal = ({
  open,
  onClose,
  onPromote,
  piece,
  mandatory = false,
}) => {
  if (!piece) return null;

  const rule = promotionRules[piece.name];
  if (!rule) return null;

  const handlePromote = () => {
    onPromote(piece.id, rule.promotedName, rule.promotedImage);
    // Don't call onClose() here - let the promotion handler manage the modal state
  };

  const handleDecline = () => {
    onClose();
  };

  const handleDialogClose = (event, reason) => {
    // Only allow closing if it's not mandatory promotion or if user explicitly declines
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      if (!mandatory) {
        onClose();
      }
      // For mandatory promotions, don't allow closing by clicking outside
    } else {
      onClose();
    }
  };

  const promotedPieceInfo = pieceInfo[rule.promotedName];

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background:
              "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
            border: "2px solid rgba(78, 205, 196, 0.3)",
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          color: "#4ecdc4",
          fontSize: "1.8rem",
          fontWeight: "bold",
          borderBottom: "1px solid rgba(78, 205, 196, 0.2)",
          pb: 2,
        }}
      >
        {mandatory ? "⚠️ Mandatory Promotion!" : "🎯 Promotion Opportunity!"}
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 2,
              fontSize: "1.2rem",
            }}
          >
            Your{" "}
            <strong style={{ color: "#ff6b6b" }}>
              {pieceInfo[piece.name]?.englishName}
            </strong>{" "}
            has entered the promotion zone!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            {mandatory
              ? "This piece has reached a position where promotion is mandatory! It cannot move without being promoted."
              : "In Shogi, pieces can be promoted when they reach the opponent's territory. Promotion is optional but usually beneficial!"}
          </Typography>
        </Box>

        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                background: "rgba(255, 107, 107, 0.1)",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#ff6b6b", mb: 2, fontWeight: "bold" }}
                >
                  Current Piece
                </Typography>
                <Box
                  component="img"
                  src={piece.image}
                  alt={piece.name}
                  sx={{
                    width: 60,
                    height: 60,
                    mb: 2,
                    filter: "drop-shadow(0 0 8px rgba(255, 107, 107, 0.3))",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  {pieceInfo[piece.name]?.englishName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}
                >
                  {pieceInfo[piece.name]?.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                background: "rgba(78, 205, 196, 0.1)",
                border: "1px solid rgba(78, 205, 196, 0.3)",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#4ecdc4", mb: 2, fontWeight: "bold" }}
                >
                  Promoted Piece
                </Typography>
                <Box
                  component="img"
                  src={rule.promotedImage}
                  alt={rule.promotedName}
                  sx={{
                    width: 60,
                    height: 60,
                    mb: 2,
                    filter: "drop-shadow(0 0 8px rgba(78, 205, 196, 0.3))",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  {promotedPieceInfo?.englishName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}
                >
                  {promotedPieceInfo?.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        <Box
          sx={{
            background: "rgba(69, 183, 209, 0.1)",
            border: "1px solid rgba(69, 183, 209, 0.3)",
            borderRadius: 2,
            p: 3,
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#45b7d1",
              mb: 2,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            💡 Promotion Rules
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            • Promotion is <strong>optional</strong> - you can choose to promote
            or not
            <br />
            • Once promoted, pieces cannot be "unpromoted"
            <br />
            • Promoted pieces are usually stronger than their original form
            <br />• Kings and Gold Generals cannot be promoted
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
        {!mandatory && (
          <Button
            onClick={handleDecline}
            variant="outlined"
            sx={{
              color: "rgba(255,255,255,0.8)",
              borderColor: "rgba(255,255,255,0.3)",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              "&:hover": {
                borderColor: "#ff6b6b",
                color: "#ff6b6b",
                backgroundColor: "rgba(255, 107, 107, 0.1)",
              },
            }}
          >
            Keep Original
          </Button>
        )}
        <Button
          onClick={handlePromote}
          variant="contained"
          sx={{
            background: "linear-gradient(45deg, #4ecdc4, #45b7d1)",
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
            "&:hover": {
              background: "linear-gradient(45deg, #45b7d1, #4ecdc4)",
              transform: "scale(1.05)",
            },
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(78, 205, 196, 0.3)",
          }}
        >
          Promote Piece! ✨
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromotionModal;
