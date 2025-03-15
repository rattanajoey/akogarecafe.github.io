import { Grid2, Box } from "@mui/material";
import { styled } from "@mui/system";

export const PortfolioWrapper = styled(Grid2)({
  backgroundColor: "#000",
  minHeight: "100vh",
});

export const BackgroundContianer = styled(Grid2)(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.up("lg")]: {
    background: `url(${process.env.PUBLIC_URL}/portfolio/sao_bg.gif) fixed repeat-y 55px -10px, url(${process.env.PUBLIC_URL}/portfolio/sao_bg_line.png) fixed repeat-y 55px -10px`,
  },
}));

export const SkillsContainerWrapper = styled(Grid2)(({ theme }) => ({
  paddingLeft: "224px",
  paddingRight: "32px",
  marginTop: "32px",
  [theme.breakpoints.down("md")]: {
    padding: 0,
  },
}));

export const SKillGrid = styled(Grid2)(({ theme }) => ({
  marginTop: "32px",
  justifyContent: "flex-start",
  [theme.breakpoints.up("sm")]: {
    justifyContent: "flex-end",
  },
}));

export const UserNameContainer = styled(Grid2)(({ theme }) => ({
  color: "white",
  padding: "24px",
  textAlign: "left",
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    borderWidth: "3px",
    borderStyle: "solid",
    borderImageSource:
      "linear-gradient(to bottom right, #006672, rgba(0, 0, 0, 0) 50%, #006672)",
    borderImageSlice: 1,
    width: "80%",
  },
}));

export const SkillsContainer = styled(Box)(({ theme }) => ({
  padding: "24px",
  color: "rgb(148, 163, 184)",
  textAlign: "left",

  "& strong": {
    color: "#f8f8f8",
  },
  [theme.breakpoints.up("sm")]: {
    background:
      "linear-gradient(to bottom right, rgba(8, 19, 24, 0.8), rgba(8, 19, 24, 0) 50%, rgba(8, 19, 24, 0.8))",
    borderWidth: "3px",
    borderStyle: "solid",
    borderImageSource:
      "linear-gradient(to bottom right, #006672, rgba(0, 0, 0, 0) 50%, #006672)",
    borderImageSlice: 1,
  },
}));

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

export const CompanyTitleContainer = styled(Grid2)({
  alignItems: "center",
  fontSize: "22px",
  "& svg": {
    color: "#006672",
  },
  display: "flex",
});

export const CompanyTitle = styled("a")(({ theme }) => ({
  color: "#006672",
  textDecoration: "none",
  [theme.breakpoints.down("sm")]: { fontSize: "18px" },
}));

export const ArrowContainer = styled(Box)(({ ishovered }) => ({
  display: "flex",
  alignItems: "center",
  transition: "transform 0.3s",
  transform:
    ishovered === "true" ? "translate(5px, -5px)" : "translate(0px, 0px)",

  svg: {
    fontSize: "24px",
    transition: "transform 0.3s, font-size 0.3s",
    transform: ishovered === "true" ? "scale(1.1)" : "scale(1)",
  },
}));

export const CompanyContainer = styled(Grid2)({
  "> div": {
    gap: "0px",
  },
});
