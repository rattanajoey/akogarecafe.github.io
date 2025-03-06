import { styled, keyframes } from "@mui/material";

// Keyframes for animations
const onpuLineAnime = keyframes`
  0% { transform: scaleY(1); }
  100% { transform: scaleY(0.7); }
`;

const onpuAnime1 = keyframes`
  0% { transform: translate(0, 0); }
  100% { transform: translate(0, -10px); }
`;

const onpuAnime2 = keyframes`
  0% { transform: translate(0, 0); }
  100% { transform: translate(0, 20px); }
`;

// Outer container
export const OnpuContainer = styled("div")({
  position: "fixed",
  bottom: "-5vw",
  left: "-2vw",
  width: "70vw",
  height: "calc(70vw * (19.53 / 59.37))",
  pointerEvents: "none",
  transform: "scaleX(-1) rotate(-7deg)",
});

// Layer Styling
export const Layer = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% auto",
  height: "100%",
  width: "100%",
  opacity: 1,
  transformOrigin: "0 20%",
});

// Individual Layers
export const Layer1 = styled(Layer)(({ theme }) => ({
  backgroundImage: 'url("/music/onpu_line.png")',
  animation: `${onpuLineAnime} 5s linear infinite alternate-reverse`,
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export const Layer2 = styled(Layer)(({ theme }) => ({
  backgroundImage: 'url("/music/onpu_item1.png")',
  animation: `${onpuAnime1} 2s linear infinite alternate-reverse`,
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export const Layer3 = styled(Layer)(({ theme }) => ({
  backgroundImage: 'url("/music/onpu_item2.png")',
  animation: `${onpuAnime2} 2s linear infinite alternate-reverse`,
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));
