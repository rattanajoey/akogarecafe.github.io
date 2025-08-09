import React from "react";
import Grid2 from "@mui/material/Grid2";
import { MusicWrapper } from "./style";
import MusicEffect from "../MusicEffect/MusicEffect";
import MusicShelf from "../MusicShelf/MusicShelf";

const MusicSection = () => {
  return (
    <MusicWrapper>
      <MusicEffect />
      <Grid2 container spacing={3} p={3} pb={48}>
        <MusicShelf />
      </Grid2>
    </MusicWrapper>
  );
};

export default MusicSection;
