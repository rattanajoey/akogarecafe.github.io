import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const NiraImage = styled("img")({
  height: "auto",
  display: "block",
});

export const SpeedDialContainer = styled(Box)({
  bottom: 0,
  ".MuiSpeedDial-fab": {
    backgroundColor: "initial !important",
    boxShadow: "initial !important",
    height: "auto",
    width: "auto",
  },
});
