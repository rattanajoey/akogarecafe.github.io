import React, { useEffect } from 'react';
import { IntroContainer, PuzzlePiece } from './style';

const Intro = () => {
  const numPieces = 10;

  useEffect(() => {
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach((piece, index) => {
      setTimeout(() => {
        piece.style.opacity = '1';
        piece.style.transform = 'scale(1)';
      }, index * 300); 
    });

  }, []);

  return (
    <IntroContainer>
      {Array.from({ length: numPieces }, (_, index) => (
        <PuzzlePiece key={index} className="puzzle-piece" />
      ))}
    </IntroContainer>
  );
};


export default Intro;
