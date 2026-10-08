import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const MusicShelfWrapper = styled("div")(({ theme }) => ({
  display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", alignItems: "flex-end",
  padding: 48, background: "radial-gradient(circle, #1e1e2e, #282a36)", position: "relative", zIndex: 1,
  width: "100%", borderRadius: 12,
  [theme.breakpoints.down("sm")]: { padding: 16, gap: 16 },
}));
export const Album = styled("div")({
  width: "clamp(100px, 12vw, 180px)", height: "clamp(100px, 12vw, 180px)", borderRadius: 12,
  background: "#333", boxShadow: "0 5px 15px rgba(0,0,0,0.4)", overflow: "hidden",
});
export const AlbumCover = styled("img")({ width: "100%", height: "100%", display: "block", objectFit: "cover" });
export const AlbumDetailsImg = styled(Box)({ width: "100%", maxWidth: 300, borderRadius: 12, boxShadow: "4px 4px 15px rgba(0,0,0,0.5)", marginBottom: 16 });
