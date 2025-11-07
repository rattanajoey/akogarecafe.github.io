import React, { useState } from "react";
import { IconButton, Snackbar, Alert, Tooltip } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const InviteShare = ({ variant = "icon" }) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const siteUrl = "https://akogarecafe.com";
  const shareTitle = "Akogare Cafe";
  const shareText =
    "Check out Akogare Cafe - A cozy corner for anime, manga, music, and monthly movie club! 🎬🎵";

  const handleShare = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: siteUrl,
        });
        setSnackbarMessage("Thanks for sharing!");
        setSnackbarSeverity("success");
        setShowSnackbar(true);
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          // Fallback to copy
          handleCopyLink();
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setSnackbarMessage("Link copied to clipboard!");
      setSnackbarSeverity("success");
      setShowSnackbar(true);
    } catch (error) {
      console.error("Failed to copy:", error);
      setSnackbarMessage("Failed to copy link");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (variant === "icon") {
    return (
      <>
        <Tooltip title="Share Akogare Cafe" arrow>
          <IconButton
            onClick={handleShare}
            aria-label="Share"
            sx={{
              color: "white",
              "&:hover": { color: "#4ecdc4" },
            }}
            size="small"
          >
            <ShareIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
          </IconButton>
        </Tooltip>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // For SpeedDial action variant
  return (
    <>
      <ShareIcon />
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InviteShare;

