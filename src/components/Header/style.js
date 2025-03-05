import { Box, styled, Typography } from "@mui/material";

export const SocialMediaContainer = styled(Box)(({ theme }) => ({
  a: { color: "white" },
  position: "static",
  [theme.breakpoints.up("sm")]: {
    position: "absolute",
  },
}));

export const Title = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  flexGrow: 1,
  fontSize: "2.5rem",

  [theme.breakpoints.down("sm")]: {
    fontSize: "1.5rem",
    padding: "8px 0",
  },
}));
