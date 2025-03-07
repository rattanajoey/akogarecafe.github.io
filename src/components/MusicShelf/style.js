import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

// Wrapper for the entire shelf
export const MusicShelfWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "32px",
  justifyContent: "center",
  alignItems: "flex-end", // Make albums align better with the shelf
  padding: "48px 0",
  background: "radial-gradient(circle, #1e1e2e, #282a36)",
  position: "relative",
}));

// Album Container
export const Album = styled(motion.div)(({ theme }) => ({
  width: "clamp(100px, 12vw, 180px)",
  height: "clamp(100px, 12vw, 180px)",
  borderRadius: "12px",
  background: "#333",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.4)", // Stronger shadow to give a floating look
  cursor: "pointer",
  transform: "perspective(800px) rotateX(10deg)", // Adds slight 3D tilt
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "perspective(800px) rotateX(5deg) scale(1.05)",
  },
}));

// Album Cover Image
export const AlbumCover = styled("img")({
  width: "100%",
  height: "100%",
  borderRadius: "12px",
  objectFit: "cover",
});

// Album Details (Expanded View)
export const AlbumDetails = styled(motion.div)({
  position: "fixed",
  top: "60%",
  left: "50%",
  transform: "translate(-50%, -50%) perspective(800px) rotateX(-5deg)",
  width: "clamp(280px, 40vw, 500px)",
  background: "#1e1e2e",
  borderRadius: "16px",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  padding: "24px",
  color: "white",
  textAlign: "center",
  zIndex: 1000,
  transition: "transform 0.4s ease-out",
});

export const CloseIconContainer = styled(Box)({
  position: "absolute",
  top: "12px",
  right: "12px",
  background: "rgba(255, 255, 255, 0.2)",
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "0.3s",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.4)",
  },
});

export const AlbumDetailsImg = styled(Box)({
  width: "100%",
  maxWidth: "300px",
  borderRadius: "12px",
  boxShadow: "4px 4px 15px rgba(0, 0, 0, 0.5)",
  marginBottom: "16px",
});
