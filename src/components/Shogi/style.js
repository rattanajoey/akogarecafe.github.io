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
  width: "min(490px, 100%)",
  margin: "auto",
  marginTop: "20px",
  position: "relative",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
  [theme.breakpoints.down("sm")]: {
    padding: "12px",
  },
}));

export const ShogiBoard = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(9, 1fr)",
  gridTemplateRows: "repeat(9, 1fr)",
  width: "100%",
  aspectRatio: "1 / 1",
  position: "relative",
  border: "5px solid #000",
  borderRadius: "5px",
});

export const ShogiPiece = styled("button")({
  width: `${100 / 9}%`,
  height: `${100 / 9}%`,
  border: 0,
  padding: 0,
  background: "transparent",
  position: "absolute",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2,
  "& img": {
    objectFit: "contain",
    width: "80%",
    height: "80%",
  },
});

export const DropZone = styled("button")`
  position: absolute;
  width: ${100 / 9}%;
  height: ${100 / 9}%;
  padding: 0;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid #000;
  &:disabled { cursor: default; }
  &:focus-visible { outline: 3px solid #fff; outline-offset: -3px; }
`;

export const HighlightCircle = styled("div")({
  position: "absolute",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: "rgba(0, 255, 0, 0.6)",
  pointerEvents: "none",
});
