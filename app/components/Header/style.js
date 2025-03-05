import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const SocialMediaContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export const Title = styled(Box)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  cursor: "pointer",
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.2rem",
  },
}));

export const NavLinksContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(1),
  },
})); 