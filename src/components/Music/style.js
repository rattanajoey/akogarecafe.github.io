import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const SongContainer = styled(Box)({
  position: "absolute",
  top: 0,
  right: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: "white",
});

export const SongList = styled("ul")({
  li: { padding: "8px", textAlign: "left" },
});
