import React from 'react';
import { Typography } from '@mui/material';
import { MomoContainer, MomoImage, SpeechBubble } from './style';


const MomoComponent = ({ text, secondLine, player }) => (
  <MomoContainer>
    {player === 'P2' ? (
      <>
        <MomoImage src="/pieces/Rei.png" alt="Rei" />
        <SpeechBubble player={player}>
          <Typography variant="body2">{text}</Typography>
          <Typography variant="body2">{secondLine}</Typography>
        </SpeechBubble>
      </>
    ) : (
      <>
        <SpeechBubble player={player}>
          <Typography variant="body2">{text}</Typography>
          <Typography variant="body2">{secondLine}</Typography>
        </SpeechBubble>
        <MomoImage src="/pieces/Momo.png" alt="Momo" />
      </>
    )}
  </MomoContainer>
);

export default MomoComponent;
