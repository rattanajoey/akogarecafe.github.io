import React, { useState } from "react";
import { SpeedDial, SpeedDialAction, Snackbar, Alert } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import ShareIcon from "@mui/icons-material/Share";
import { NiraImage, SpeedDialContainer } from "./style";
import { useNavigate } from "react-router-dom";

const SpeedDialComponent = ({ onIconSelect }) => {
  const [open, setOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  const actions = [
    { icon: <ShareIcon />, name: "Share", isShare: true },
    { icon: <ArticleIcon />, name: "Portfolio" },
    { icon: <MovieFilterIcon />, name: "MovieClub" },
    { icon: <LibraryMusicIcon />, name: "Music" },
    { icon: <HomeIcon />, name: "" },
  ];

  const handleIconClick = (iconName) => {
    if (onIconSelect) {
      onIconSelect(iconName);
    }
  };

  const handleShare = async () => {
    const siteUrl = "https://akogarecafe.com";
    const shareTitle = "Akogare Cafe";
    const shareText =
      "Check out Akogare Cafe - A cozy corner for anime, manga, music, and monthly movie club! 🎬🎵";

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
          handleCopyLink(siteUrl);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink(siteUrl);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
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

  const handleAction = (action) => {
    if (action.isShare) {
      handleShare();
    } else {
      navigate(action.name.toLowerCase());
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const imageSrc = open ? "/pieces/nira2.png" : "/pieces/nira.png";

  return (
    <SpeedDialContainer>
      <SpeedDial
        ariaLabel="SpeedDial openIcon example"
        sx={{ position: "fixed", bottom: 0, right: { xs: 0, sm: 48 } }}
        icon={<NiraImage src={imageSrc} alt="Nira" />}
        onClick={() => setOpen((prev) => !prev)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              handleIconClick(action.name);
              handleAction(action);
            }}
          />
        ))}
      </SpeedDial>
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
    </SpeedDialContainer>
  );
};

export default SpeedDialComponent;
