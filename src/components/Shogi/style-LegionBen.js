import { styled } from "@mui/system";

export const ShogiBoardWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: "url(/pieces/wood_texture.jpg)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  padding: "20px",
  borderRadius: "10px",
  width: "450px",
  height: "450px",
  margin: "auto",
  marginTop: "20px",
  position: "relative",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export const ShogiBoard = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(9, 50px)",
  gridTemplateRows: "repeat(9, 50px)",
  gap: "1px",
  width: "450px",
  height: "450px",
  position: "relative",
  border: "5px solid #000",
  borderRadius: "5px",
});

export const ShogiPiece = styled("div")({
  width: "50px",
  height: "50px",
  position: "absolute",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2,
  "& img": {
    objectFit: "cover",
    width: "40px",
    height: "40px",
  },
});

export const DropZone = styled("div")`
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid #000;
`;

export const HighlightCircle = styled("div")({
  position: "absolute",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: "rgba(0, 255, 0, 0.6)",
  pointerEvents: "none",
});
