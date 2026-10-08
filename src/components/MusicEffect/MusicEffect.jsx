import React from "react";
import { Layer1, Layer2, Layer3, OnpuContainer } from "./style";

const MusicEffect = () => {
  return (
    <OnpuContainer aria-hidden="true">
      <Layer1 />
      <Layer2 />
      <Layer3 />
    </OnpuContainer>
  );
};

export default MusicEffect;
