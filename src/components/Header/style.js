import { Box, styled, Typography } from "@mui/material";

export const SocialMediaContainer = styled(Box)(({ theme }) => ({
  a: { color: "white" },
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const Title = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  flexGrow: 1,
  fontSize: "2.5rem",
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,

  [theme.breakpoints.down("sm")]: {
    fontSize: "1.5rem",
    padding: "8px 0",
    position: "static",
    transform: "none",
  },
}));
