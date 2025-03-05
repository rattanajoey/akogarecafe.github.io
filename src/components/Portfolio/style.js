import { Grid2, Box } from "@mui/material";
import { styled } from "@mui/system";

export const PortfolioWrapper = styled(Grid2)({
  backgroundColor: "#000",
  minHeight: "100vh",
});

export const BackgroundContianer = styled(Grid2)({
  background: `url(${process.env.PUBLIC_URL}/portfolio/sao_bg.gif) fixed repeat-y 55px -10px, url(${process.env.PUBLIC_URL}/portfolio/sao_bg_line.png) fixed repeat-y 55px -10px`,
  minWidth: "1200px",
  width: "100%",
});

export const UserNameContainer = styled(Box)({
  borderWidth: "3px",
  borderStyle: "solid",
  borderImageSource:
    "linear-gradient(to bottom right, #006672, rgba(0, 0, 0, 0) 50%, #006672)",
  borderImageSlice: 1,
  padding: "24px",
  color: "white",
  textAlign: "left",
  width: "80%",
});

export const SkillsContainer = styled(Box)({
  borderWidth: "3px",
  borderStyle: "solid",
  borderImageSource:
    "linear-gradient(to bottom right, #006672, rgba(0, 0, 0, 0) 50%, #006672)",
  borderImageSlice: 1,
  padding: "24px",
  color: "rgb(148, 163, 184)",
  textAlign: "left",
  background:
    "linear-gradient(to bottom right, rgba(8, 19, 24, 0.8), rgba(8, 19, 24, 0) 50%, rgba(8, 19, 24, 0.8))",
  "& strong": {
    color: "#f8f8f8",
  },
});

export const SkillIcon = styled(Box)({
  width: "35px",
  height: "35px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  background: "rgba(255, 255, 255, 0.1)",
  border: "3px solid white",
  borderRadius: "0px 15px",
});

export const CompanyTitleContainer = styled(Box)({
  alignItems: "center",
  fontSize: "22px",
  "& svg": {
    color: "#006672",
  },
  display: "flex",
});

export const CompanyTitle = styled("a")({
  color: "#006672",
  textDecoration: "none",
});

export const ArrowContainer = styled(Box)(({ isHovered }) => ({
  display: "flex",
  alignItems: "center",
  transition: "transform 0.3s",
  transform: isHovered ? "translate(5px, -5px)" : "translate(0px, 0px)",

  svg: {
    fontSize: "24px",
    transition: "transform 0.3s, font-size 0.3s",
    transform: isHovered ? "scale(1.1)" : "scale(1)",
  },
}));

export const CompanyContainer = styled(Grid2)({
  "> div": {
    gap: "0px",
  },
});
