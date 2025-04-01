import { Box, styled } from "@mui/material";

export const MaoMaoImage = styled("img")(({ theme }) => ({
  height: "auto",
  position: "absolute",
  left: "-10%",
  top: "-70px",
  [theme.breakpoints.up("sm")]: {
    position: "relative",
    top: 0,
    left: 0,
  },
}));

export const ModalContainer = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
});

export const MaoMaoTextBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  right: "30%",
  top: "-20px",
  backgroundColor: "#d2d2cb",
  whiteSpace: "nowrap",
  padding: "0.5rem",
  borderRadius: "10px",
  [theme.breakpoints.up("sm")]: {
    top: "50px",
    right: "60%",
  },
}));
